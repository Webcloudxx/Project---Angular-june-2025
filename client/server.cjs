const path = require('path');

console.log('[diag] cwd       =', process.cwd());
console.log('[diag] __dirname =', __dirname);
console.log('[diag] module.paths =', module.paths);

let jsonServer;
let auth;
let cors;

try {
  jsonServer = require('json-server');
  console.log('[diag] require("json-server") OK');
} catch (e) {
  console.warn('[diag] require("json-server") FAILED:', e.message);
  const fallback = path.join(__dirname, 'node_modules', 'json-server', 'lib', 'server', 'index.js');
  console.warn('[diag] trying fallback path =>', fallback);
  jsonServer = require(fallback);
  console.log('[diag] fallback load json-server OK');
}

try {
  auth = require('json-server-auth');
  console.log('[diag] require("json-server-auth") OK');
} catch (e) {
  console.warn('[diag] require("json-server-auth") FAILED:', e.message);
  const fallbackAuth = path.join(__dirname, 'node_modules', 'json-server-auth', 'dist', 'index.js');
  console.warn('[diag] trying fallback path =>', fallbackAuth);
  auth = require(fallbackAuth);
  console.log('[diag] fallback load json-server-auth OK');
}

try {
  cors = require('cors');
  console.log('[diag] require("cors") OK');
} catch (e) {
  console.warn('[diag] require("cors") FAILED:', e.message);
  const fallbackCors = path.join(__dirname, 'node_modules', 'cors');
  console.warn('[diag] trying fallback path =>', fallbackCors);
  cors = require(fallbackCors);
  console.log('[diag] fallback load cors OK');
}

const app = jsonServer.create();
const dbPath = path.join(__dirname, 'db.json');
console.log('[diag] dbPath =', dbPath);

const router = jsonServer.router(dbPath);
app.db = router.db;

app.use(cors());
app.use(jsonServer.defaults());
app.use(jsonServer.bodyParser);

app.use(auth);
app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JSON Server + Auth on http://localhost:${PORT}`);
  console.log(`   • POST /register   • POST /login`);
  console.log(`   • /posts           • /comments   • /users`);
});