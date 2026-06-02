import { readFile } from 'node:fs/promises';
import { mapSupabaseRow } from './supabase-map.mjs';

// Le do JSON local (semente / fallback). `jsonUrl` aceita caminho ou URL de arquivo.
export async function fromJson(jsonUrl) {
  return JSON.parse(await readFile(jsonUrl, 'utf8'));
}

// Le posts publicados do Supabase via PostgREST com a service key. Zero dependencia.
export async function fromSupabase({ url, serviceKey, fetchImpl = fetch }) {
  const endpoint = `${url}/rest/v1/posts?status=eq.published&select=*`;
  const res = await fetchImpl(endpoint, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${res.status}: ${body}`);
  }
  const rows = await res.json();
  return rows.map(mapSupabaseRow);
}

// Decide a fonte: Supabase se as env vars existirem, senao o JSON.
export async function loadPosts({ env = process.env, jsonUrl, fetchImpl } = {}) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    return fromSupabase({ url: env.SUPABASE_URL, serviceKey: env.SUPABASE_SERVICE_KEY, fetchImpl });
  }
  return fromJson(jsonUrl);
}
