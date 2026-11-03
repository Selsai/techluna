const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

// Lance les deux processus de développement sans dépendance supplémentaire.
const root = path.resolve(__dirname, '..');
const vite = path.join(root, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js');
if (!fs.existsSync(vite)) {
  process.stderr.write('Dépendances manquantes : lancez npm --prefix backend ci et npm --prefix frontend ci.\n');
  process.exit(1);
}

const children = [
  spawn(process.execPath, [path.join(root, 'backend', 'server.js')], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, [vite, '--host', 'localhost', '--port', '5173', '--strictPort'], { cwd: path.join(root, 'frontend'), stdio: 'inherit' }),
];

let stopping = false;
/** Arrête le backend et Vite ensemble lorsque le terminal est fermé. */
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', (error) => { process.stderr.write(`${error.message}\n`); stop(1); });
  child.on('exit', (code) => { if (!stopping) stop(code || 1); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
