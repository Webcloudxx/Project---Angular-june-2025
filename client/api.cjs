const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- JWT ---
const SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const sign = (user) => jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '12h' });

const auth = (req, res, next) => {
  const hdr = req.headers['authorization'];
  if (!hdr) return res.sendStatus(401);
  const token = hdr.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

const maybeAuth = (req, _res, next) => {
  const hdr = req.headers['authorization'];
  if (!hdr) return next();
  const token = hdr.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (!err) req.user = decoded;
    next();
  });
};

// --- DB (lowdb) ---
const file = path.join(process.cwd(), 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: [], posts: [] });

async function initDb() {
  await db.read();
  // default structure
  db.data ||= { users: [], posts: [] };
  db.data.users ||= [];
  db.data.posts ||= [];
  await db.write();
}

function sanitizePost(p, userId) {
  const likes = Array.isArray(p.likes) ? p.likes : [];
  return {
    id: String(p.id),
    title: p.title || '',
    content: p.content || '',
    mediaUrl: p.mediaUrl ?? null,
    authorId: String(p.authorId || ''),
    authorName: p.authorName || '',
    likeCount: likes.length,
    likedByMe: userId ? likes.includes(String(userId)) : false,
    commentCount: typeof p.commentCount === 'number' ? p.commentCount : 0,
    createdAt: p.createdAt || null,
  };
}

// ------------- Auth -------------
app.post('/api/register', async (req, res) => {
  try {
    await initDb();
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const users = db.data.users;
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });

    const user = { id: Date.now().toString(), email, password }; // plain text pw for dev
    users.push(user);
    await db.write();

    const token = sign(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error('REGISTER ERROR', e);
    res.sendStatus(500);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    await initDb();
    const { email, password } = req.body || {};
    const users = db.data.users || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = sign(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error('LOGIN ERROR', e);
    res.sendStatus(500);
  }
});

app.get('/api/me', auth, (req, res) => res.json(req.user));

// ------------- Posts -------------
app.get('/api/posts', maybeAuth, async (req, res) => {
  try {
    await initDb();
    const q = (req.query.q || '').toString().toLowerCase();
    const authorId = req.query.authorId ? String(req.query.authorId) : null;

    let posts = db.data.posts || [];
    if (authorId) {
      posts = posts.filter(p => String(p.authorId) === authorId);
    }
    if (q) {
      posts = posts.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q)
      );
    }
    res.json(posts.map(p => sanitizePost(p, req.user?.id)));
  } catch (e) {
    console.error('LIST POSTS ERROR', e);
    res.sendStatus(500);
  }
});

app.get('/api/posts/:id', maybeAuth, async (req, res) => {
  try {
    await initDb();
    const id = String(req.params.id);
    const p = (db.data.posts || []).find(x => String(x.id) === id);
    if (!p) return res.sendStatus(404);
    res.json(sanitizePost(p, req.user?.id));
  } catch (e) {
    console.error('GET POST ERROR', e);
    res.sendStatus(500);
  }
});

app.post('/api/posts', auth, async (req, res) => {
  try {
    await initDb();
    const { title, content, mediaUrl } = req.body || {};
    if (!title || !content) return res.status(400).json({ message: 'title & content required' });

    const post = {
      id: Date.now().toString(),
      title,
      content,
      mediaUrl: mediaUrl ?? null,
      authorId: String(req.user.id),
      authorName: req.user.email,
      likes: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    db.data.posts.push(post);
    await db.write();
    res.status(201).json(sanitizePost(post, req.user.id));
  } catch (e) {
    console.error('CREATE POST ERROR', e);
    res.sendStatus(500);
  }
});

app.patch('/api/posts/:id', auth, async (req, res) => {
  try {
    await initDb();
    const id = String(req.params.id);
    const posts = db.data.posts || [];
    const p = posts.find(x => String(x.id) === id);
    if (!p) return res.sendStatus(404);
    if (String(p.authorId) !== String(req.user.id)) return res.sendStatus(403);

    const { title, content, mediaUrl } = req.body || {};
    if (title !== undefined) p.title = title;
    if (content !== undefined) p.content = content;
    if (mediaUrl !== undefined) p.mediaUrl = mediaUrl;
    await db.write();
    res.json(sanitizePost(p, req.user.id));
  } catch (e) {
    console.error('UPDATE POST ERROR', e);
    res.sendStatus(500);
  }
});

app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    await initDb();
    const id = String(req.params.id);
    const posts = db.data.posts || [];
    const idx = posts.findIndex(x => String(x.id) === id);
    if (idx === -1) return res.sendStatus(404);
    if (String(posts[idx].authorId) !== String(req.user.id)) return res.sendStatus(403);
    posts.splice(idx, 1);
    await db.write();
    res.sendStatus(204);
  } catch (e) {
    console.error('DELETE POST ERROR', e);
    res.sendStatus(500);
  }
});

app.post('/api/posts/:id/like', auth, async (req, res) => {
  try {
    await initDb();
    const id = String(req.params.id);
    const posts = db.data.posts || [];
    const p = posts.find(x => String(x.id) === id);
    if (!p) return res.sendStatus(404);

    p.likes = Array.isArray(p.likes) ? p.likes : [];
    const me = String(req.user.id);
    const i = p.likes.indexOf(me);
    if (i === -1) p.likes.push(me);
    else p.likes.splice(i, 1);

    await db.write();
    res.json(sanitizePost(p, req.user.id));
  } catch (e) {
    console.error('LIKE TOGGLE ERROR', e);
    res.sendStatus(500);
  }
});

// simple health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// error handler (last)
app.use((err, _req, res, _next) => {
  console.error('UNHANDLED', err);
  res.sendStatus(500);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await initDb();
  console.log(`API running on http://localhost:${PORT}`);
});