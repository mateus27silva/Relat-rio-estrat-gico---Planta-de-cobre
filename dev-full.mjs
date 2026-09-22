/**
 * dev-full.mjs — sobe o backend (server.ts) e o Vite dev server juntos, de
 * forma multiplataforma. O script anterior usava "npm run server & npm run dev"
 * no package.json, que só funciona em shells estilo bash: no cmd.exe do
 * Windows "&" apenas encadeia comandos em sequência, então o Vite nunca
 * chegava a subir e o front-end ficava sem backend (erro "Não foi possível
 * conectar ao PI").
 *
 * Chama os binários locais (node_modules/.bin) diretamente, como uma única
 * string de comando com shell:true — passar um array de args junto com
 * shell:true é instável no Windows (Node avisa isso com DEP0190) e deixava
 * os processos subindo sem nunca abrir a porta.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === "win32";
const bin = (name) => path.join(root, "node_modules", ".bin", isWin ? `${name}.cmd` : name);

function run(name, command) {
  const p = spawn(command, { cwd: root, stdio: "inherit", shell: true });
  p.on("exit", (code) => {
    console.log(`[dev-full] ${name} encerrou (código ${code})`);
    shutdown();
  });
  return p;
}

const procs = [];
let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of procs) {
    if (!p.killed) p.kill();
  }
  process.exit();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

procs.push(run("server", `"${bin("tsx")}" --watch server.ts`));
procs.push(run("vite", `"${bin("vite")}" --port=3000 --host=0.0.0.0`));
