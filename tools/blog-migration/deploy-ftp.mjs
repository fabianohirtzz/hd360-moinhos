// Publica o resultado do build do blog na hospedagem (ErêHost) por FTP com TLS.
// Uso: FTP_HOST=... FTP_USER=... FTP_PASS=... node tools/blog-migration/deploy-ftp.mjs <slugs-antes.json>
// <slugs-antes.json> é a cópia de assets/blog/generated-slugs.json feita ANTES do build,
// para saber quais posts foram excluídos e apagar as pastas deles no servidor.
import { readFileSync, writeFileSync, mkdtempSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { deployPlan } from './lib/deploy-plan.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const { FTP_HOST, FTP_USER, FTP_PASS } = process.env;
if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
  console.error('Faltam FTP_HOST, FTP_USER ou FTP_PASS.');
  process.exit(1);
}

// credenciais num netrc temporário, fora da linha de comando
const dir = mkdtempSync(join(tmpdir(), 'ftp-'));
const netrc = join(dir, 'netrc');
writeFileSync(netrc, `machine ${FTP_HOST} login ${FTP_USER} password ${FTP_PASS}\n`, { mode: 0o600 });

const BASE = `ftp://${FTP_HOST}/`;
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
// -k: o certificado do FTP da ErêHost é do servidor compartilhado, não do domínio
const curl = (args) => spawnSync('curl', ['-sS', '-k', '--ssl-reqd', '--connect-timeout', '20', '--max-time', '120', '--netrc-file', netrc, ...args], { encoding: 'utf8' });
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function remoteSize(path) {
  const r = curl(['-I', BASE + enc(path)]);
  const m = r.stdout && r.stdout.match(/Content-Length:\s*(\d+)/i);
  return m ? Number(m[1]) : -1;
}

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return []; } };
const oldSlugs = readJson(process.argv[2]);
const newSlugs = readJson(join(ROOT, 'assets/blog/generated-slugs.json'));
const { upload, remove } = deployPlan(oldSlugs, newSlugs);

// sem conexão com o FTP não adianta tentar arquivo por arquivo
const teste = curl(['--list-only', BASE]);
if (teste.status !== 0) {
  console.error(`Não conectou no FTP ${FTP_HOST}: ${(teste.stderr || '').trim()}`);
  process.exit(1);
}

const falhas = [];
for (const f of upload) {
  let ok = false;
  for (let t = 1; t <= 5 && !ok; t++) {
    const r = curl(['--ftp-create-dirs', '-T', join(ROOT, f), BASE + enc(f)]);
    ok = r.status === 0 && remoteSize(f) === statSync(join(ROOT, f)).size;
    if (!ok) { console.log(`  tentativa ${t} de ${f}: ${(r.stderr || '').trim() || 'tamanho diferente no servidor'}`); sleep(1500 * t); }
  }
  console.log(ok ? '  ok' : '  FALHOU', f);
  if (!ok) falhas.push(f);
}

for (const slug of remove) {
  const r = curl(['-Q', `DELE ${slug}/index.html`, '-Q', `RMD ${slug}`, BASE]);
  console.log(r.status === 0 ? '  removido' : '  não removido', `${slug}/`);
}

rmSync(dir, { recursive: true, force: true });
console.log(`Publicado: ${upload.length - falhas.length}/${upload.length} arquivos, ${remove.length} post(s) removido(s).`);
if (falhas.length) process.exit(1);
