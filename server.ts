/**
 * server.ts — Backend Express que expõe os dados do PI Web API para o Relatório
 * Estratégico. Roda em paralelo com o Vite dev server (porta 3002 por padrão).
 *
 * Autenticação: cada supervisor usa o PRÓPRIO login do PI. O navegador envia o
 * header "Authorization: Basic ..." (montado a partir do que o supervisor
 * digitou na tela) e este servidor só o repassa ao PI Web API por chamada —
 * nunca grava, loga ou reutiliza a credencial de outra pessoa.
 *
 * Carrega os arquivos pi-integration/mapping-*.json (gerados pela exploração do
 * PI) e, para cada setor mapeado, busca a média do dia (00h BRT até agora) de
 * cada parâmetro. Parâmetros sem WebId mapeado simplesmente não aparecem na
 * resposta — o front-end mantém esses campos editáveis manualmente (Colar do
 * Excel / digitação), nunca inventa valor.
 */

import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { piCheckAuth, piSummaryAverages, piStreamValues } from "./pi-integration/piClient";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3002);
const MAPPING_DIR = path.join(__dirname, "pi-integration");

interface MappingEntry {
  chave: string;
  equipamento?: string;
  nomeRelatorio?: string;
  unidadeRelatorio?: string;
  piKind?: string;
  piPath?: string;
  piWebId: string;
  unidadePi?: string;
  confianca?: string;
}

// setor -> chave -> entry
const sectorMap: Record<string, Record<string, MappingEntry>> = {};

function loadMappings() {
  if (!fs.existsSync(MAPPING_DIR)) return;
  const files = fs.readdirSync(MAPPING_DIR).filter((f) => f.startsWith("mapping-") && f.endsWith(".json"));
  const NON_SECTOR_KEYS = new Set(["geradoEm", "resumo", "naoMapeados", "notasGerais", "observacoesGerais"]);
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(MAPPING_DIR, file), "utf-8"));
      for (const [key, val] of Object.entries(raw)) {
        if (NON_SECTOR_KEYS.has(key)) continue;
        if (!Array.isArray(val) || val.length === 0) continue;
        if (!sectorMap[key]) sectorMap[key] = {};
        for (const entry of val as MappingEntry[]) {
          if (entry?.chave && entry?.piWebId) sectorMap[key][entry.chave] = entry;
        }
      }
      console.log(`[pi-mapping] carregado: ${file}`);
    } catch (e: any) {
      console.error(`[pi-mapping] erro ao carregar ${file}: ${e.message}`);
    }
  }
}

loadMappings();

// ── janela do dia em BRT (UTC-3) ──────────────────────────────────────────────
function dayWindowBRT(dateStr?: string): { start: string; end: string } {
  const date = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : new Date().toISOString().split("T")[0];
  const startUtc = `${date}T03:00:00Z`; // 00:00 BRT
  const nowUtc = new Date();
  const endOfDayUtc = new Date(new Date(`${date}T03:00:00Z`).getTime() + 24 * 3600 * 1000);
  const end = nowUtc < endOfDayUtc ? nowUtc.toISOString() : endOfDayUtc.toISOString();
  return { start: startUtc, end };
}

// ── auth: exige que o supervisor tenha enviado o próprio login do PI, e CONFIRMA
// com o PI antes de seguir — sem isso, uma senha errada devolveria "sucesso"
// com dados vazios (cada tag falharia silenciosamente), escondendo o erro real.
async function requirePiAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ error: "Faça login com seu usuário e senha do PI para buscar dados." });
  }
  try {
    await piCheckAuth(authHeader);
  } catch {
    return res.status(401).json({ error: "Usuário ou senha do PI inválidos." });
  }
  (req as any).piAuth = authHeader;
  next();
}

// GET /api/pi/check-auth — valida o login do PI enviado pelo supervisor
app.get("/api/pi/check-auth", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ ok: false, error: "Credenciais não enviadas." });
  }
  try {
    await piCheckAuth(authHeader);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(401).json({ ok: false, error: "Usuário ou senha do PI inválidos." });
  }
});

// GET /api/pi/sectors — lista setores mapeados e quantos parâmetros cada um tem (não precisa de auth, é só metadado local)
app.get("/api/pi/sectors", (_req: Request, res: Response) => {
  const out: Record<string, number> = {};
  for (const [sector, entries] of Object.entries(sectorMap)) out[sector] = Object.keys(entries).length;
  res.json(out);
});

// GET /api/pi/:sector?date=YYYY-MM-DD — média do dia (00h BRT até agora) de cada parâmetro mapeado do setor
app.get("/api/pi/:sector", requirePiAuth, async (req: Request, res: Response) => {
  const sector = req.params.sector;
  const entries = sectorMap[sector];
  if (!entries) {
    return res.status(404).json({ error: `Setor "${sector}" sem mapeamento carregado`, setoresDisponiveis: Object.keys(sectorMap) });
  }

  const authHeader = (req as any).piAuth as string;
  const { start, end } = dayWindowBRT(String(req.query.date || ""));

  const webIds: Record<string, string> = {};
  for (const [chave, entry] of Object.entries(entries)) webIds[chave] = entry.piWebId;

  let averages: Record<string, number | null>;
  try {
    averages = await piSummaryAverages(webIds, start, end, authHeader);
  } catch (e: any) {
    if (e?.statusCode === 401) return res.status(401).json({ error: "Usuário ou senha do PI inválidos." });
    throw e;
  }

  // fallback: para chaves sem média (ex: ponto não suporta summary), tenta valor instantâneo
  const semMedia = Object.keys(averages).filter((k) => averages[k] === null);
  let instantaneos: Record<string, any> = {};
  if (semMedia.length > 0) {
    const webIdsFallback: Record<string, string> = {};
    semMedia.forEach((k) => (webIdsFallback[k] = webIds[k]));
    const vals = await piStreamValues(webIdsFallback, authHeader);
    for (const [k, v] of Object.entries(vals)) if (v.good && v.value !== null) instantaneos[k] = v.value;
  }

  const dados: Record<string, any> = {};
  const meta: Record<string, any> = {};
  for (const [chave, avg] of Object.entries(averages)) {
    const valor = avg !== null ? avg : instantaneos[chave];
    if (valor === undefined || valor === null) continue;
    dados[chave] = valor;
    meta[chave] = {
      fonte: avg !== null ? "media-dia" : "instantaneo",
      equipamento: entries[chave].equipamento,
      piPath: entries[chave].piPath,
      confianca: entries[chave].confianca,
    };
  }

  res.json({ sector, janela: { start, end }, dados, meta, totalMapeados: Object.keys(entries).length, totalRetornados: Object.keys(dados).length });
});

app.listen(PORT, () => {
  console.log(`[server] Backend PI rodando em http://localhost:${PORT}`);
  console.log(`[server] Setores mapeados: ${Object.keys(sectorMap).join(", ") || "(nenhum ainda — rode a exploração do PI primeiro)"}`);
});
