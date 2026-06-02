import { readFile } from 'node:fs/promises';
import { toSupabaseRow } from './lib/supabase-map.mjs';

const ROOT = new URL('../../', import.meta.url);
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

async function main() {
  const posts = JSON.parse(await readFile(new URL('assets/blog/posts.json', ROOT), 'utf8'));
  // Os 23 posts existentes entram como publicados.
  const rows = posts.map(p => toSupabaseRow(p, { status: 'published' }));

  const res = await fetch(`${url}/rest/v1/posts?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    console.error('Falha no seed:', res.status, await res.text());
    process.exit(1);
  }
  console.log(`Seed ok: ${rows.length} posts no Supabase.`);
}

main().catch(e => { console.error(e); process.exit(1); });
