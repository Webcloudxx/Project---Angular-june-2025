const { spawn } = require('child_process');
const path = require('path');

const db = path.join(__dirname, 'db.json');
const isWin = process.platform === 'win32';
const cmd = isWin ? 'npx.cmd' : 'npx';
const args = ['--yes', 'json-server-auth', db, '--port', '3000'];

console.log('[runner]', cmd, args.join(' '));
const child = spawn(cmd, args, { stdio: 'inherit' });

child.on('exit', code => {
  console.log(`[runner] json-server-auth exited with code ${code}`);
});
