/**
 * piClient.ts — cliente HTTP mínimo para o PI Web API (Mina Caraíba / ERO).
 *
 * Cada supervisor usa o próprio login do PI — a credencial NUNCA fica salva
 * no servidor. Toda função recebe `authHeader` (o header "Basic ..." que o
 * navegador do supervisor monta a partir do login que ele digitou) e só o usa
 * para aquela chamada específica. Nada é persistido em disco, log ou banco.
 */

import https from "https";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const PI_BASE = (process.env.PI_BASE || "https://pivision-caraiba.ero.com/piwebapi").replace(/\/$/, "");

function httpGetJson(url: string, authHeader: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const mod = isHttps ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
    };
    const req = mod.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          const err: any = new Error(`HTTP ${res.statusCode}: ${url}`);
          err.statusCode = res.statusCode;
          reject(err);
          return;
        }
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
    req.end();
  });
}

export interface PiValue {
  value: number | string | null;
  timestamp: string | null;
  good: boolean;
}

/** Testa se o header Authorization é aceito pelo PI Web API. Lança em caso de credencial inválida. */
export async function piCheckAuth(authHeader: string): Promise<void> {
  await httpGetJson(`${PI_BASE}/`, authHeader);
}

/** Valor atual de um WebId — funciona tanto para atributos AF quanto para pontos brutos do Data Archive. */
export async function piStreamValue(webId: string, authHeader: string): Promise<PiValue> {
  try {
    const r = await httpGetJson(`${PI_BASE}/streams/${webId}/value`, authHeader);
    const raw = r?.Value?.Value ?? r?.Value ?? null;
    const n = typeof raw === "number" ? raw : parseFloat(raw);
    return {
      value: raw !== null && !isNaN(n) && typeof raw !== "string" ? n : raw,
      timestamp: r?.Timestamp ?? null,
      good: r?.Good !== false,
    };
  } catch {
    return { value: null, timestamp: null, good: false };
  }
}

/** Busca vários WebIds em paralelo, tolerando falhas individuais. */
export async function piStreamValues(webIds: Record<string, string>, authHeader: string): Promise<Record<string, PiValue>> {
  const keys = Object.keys(webIds);
  const results = await Promise.allSettled(keys.map((k) => piStreamValue(webIds[k], authHeader)));
  const out: Record<string, PiValue> = {};
  keys.forEach((k, i) => {
    const r = results[i];
    out[k] = r.status === "fulfilled" ? r.value : { value: null, timestamp: null, good: false };
  });
  return out;
}

/** Média do período (ex: turno de 12h ou dia corrente) para um único WebId. */
export async function piSummaryAverage(webId: string, startTime: string, endTime: string, authHeader: string): Promise<number | null> {
  try {
    const q = `startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&summaryType=Average&calculationBasis=TimeWeighted`;
    const r = await httpGetJson(`${PI_BASE}/streams/${webId}/summary?${q}`, authHeader);
    const items = Array.isArray(r) ? r : r?.Items ?? [];
    const avgItem = items.find((i: any) => i.Type === "Average") ?? items[0];
    const v = parseFloat(avgItem?.Value?.Value);
    return isNaN(v) ? null : v;
  } catch {
    return null;
  }
}

/** Médias de vários WebIds em paralelo, tolerando falhas individuais. */
export async function piSummaryAverages(
  webIds: Record<string, string>,
  startTime: string,
  endTime: string,
  authHeader: string
): Promise<Record<string, number | null>> {
  const keys = Object.keys(webIds);
  const results = await Promise.allSettled(keys.map((k) => piSummaryAverage(webIds[k], startTime, endTime, authHeader)));
  const out: Record<string, number | null> = {};
  keys.forEach((k, i) => {
    const r = results[i];
    out[k] = r.status === "fulfilled" ? r.value : null;
  });
  return out;
}
