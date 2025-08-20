const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Datastore = require('nedb-promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const dataDir = path.join(__dirname, 'data');
const users = Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true });
const posts = Datastore.create({ filename: path.join(dataDir, 'posts.db'), autoload: true });
const comments = Datastore.create({ filename: path.join(dataDir, 'comments.db'), autoload: true });

app.use(cors());
app.use(express.json());

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}
function authRequired(req, res, next) {
  const hdr = req.headers.authorization || '';
  const [, token] = hdr.split(' ');
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
function isOwner(resource, userIdField, req) {
  return resource[userIdField] === req.user.id;
}

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email & password required' });

  const existing = await users.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const user = await users.insert({ email, password: hash, createdAt: Date.now() });
  const token = signToken(user);
  res.json({ accessToken: token, user: { id: user._id, email: user.email } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await users.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ accessToken: token, user: { id: user._id, email: user.email } });
});

app.get('/api/me', authRequired, async (req, res) => {
  const user = await users.findOne({ _id: req.user.id });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ id: user._id, email: user.email, createdAt: user.createdAt });
});

app.get('/api/posts', async (req, res) => {
  const { authorId, q } = req.query;
  const query = {};
  if (authorId) query.authorId = authorId;
  if (q) query.title = new RegExp(q, 'i');

  const list = await posts.find(query);
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  res.json(list);
});

app.get('/api/posts/:id', async (req, res) => {
  const doc = await posts.findOne({ _id: req.params.id });
  if (!doc) return res.status(404).json({ message: 'Post not found' });
  res.json(doc);
});

app.post('/api/posts', authRequired, async (req, res) => {
  const { title, content, mediaUrl } = req.body || {};
  if (!title || !content) return res.status(400).json({ message: 'Title & content required' });

  const doc = await posts.insert({
    title, content, mediaUrl: mediaUrl?.trim() || undefined,
    authorId: req.user.id,
    authorEmail: req.user.email,
    likeCount: 0,
    commentCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  res.status(201).json(doc);
});

app.put('/api/posts/:id', authRequired, async (req, res) => {
  const existing = await posts.findOne({ _id: req.params.id });
  if (!existing) return res.status(404).json({ message: 'Post not found' });
  if (!isOwner(existing, 'authorId', req)) return res.status(403).json({ message: 'Not your post' });

  const patch = { ...req.body, updatedAt: Date.now() };
  const updated = await posts.update({ _id: req.params.id }, { $set: patch }, { returnUpdatedDocs: true });
  res.json(updated);
});

app.delete('/api/posts/:id', authRequired, async (req, res) => {
  const existing = await posts.findOne({ _id: req.params.id });
  if (!existing) return res.status(404).json({ message: 'Post not found' });
  if (!isOwner(existing, 'authorId', req)) return res.status(403).json({ message: 'Not your post' });

  await posts.remove({ _id: req.params.id }, {});
  await comments.remove({ postId: req.params.id }, { multi: true });
  res.status(204).end();
});

app.get('/api/comments', async (req, res) => {
  const { postId } = req.query;
  if (!postId) return res.status(400).json({ message: 'postId required' });

  const list = await comments.find({ postId });
  list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  res.json(list);
});


app.post('/api/comments', authRequired, async (req, res) => {
  const { postId, text } = req.body || {};
  if (!postId || !text) return res.status(400).json({ message: 'postId & text required' });

  const post = await posts.findOne({ _id: postId });
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const c = await comments.insert({
    postId,
    authorId: req.user.id,
    authorEmail: req.user.email,
    text,
    createdAt: Date.now(),
  });
  await posts.update({ _id: postId }, { $inc: { commentCount: 1 } });
  res.status(201).json(c);
});

app.delete('/api/comments/:id', authRequired, async (req, res) => {
  const c = await comments.findOne({ _id: req.params.id });
  if (!c) return res.status(404).json({ message: 'Comment not found' });
  if (!isOwner(c, 'authorId', req)) return res.status(403).json({ message: 'Not your comment' });

  await comments.remove({ _id: req.params.id }, {});
  await posts.update({ _id: c.postId }, { $inc: { commentCount: -1 } });
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log(`Auth:    POST /api/register, POST /api/login`);
  console.log(`Posts:   GET/POST/PUT/DELETE /api/posts(/:id)`);
  console.log(`Comments:GET/POST/DELETE   /api/comments`);
});