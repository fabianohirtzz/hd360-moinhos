import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OWNER = 'fabianohirtzz';
const REPO = 'hd360-moinhos';
const EVENT_TYPE = 'publish-blog';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const pat = Deno.env.get('GITHUB_PAT');
    if (!pat) return json({ error: 'GITHUB_PAT não configurado.' }, 500);

    // 1. Garantir que quem chama é o admin autenticado.
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Não autorizado.' }, 401);

    // 2. Marcar como publicando (service key ignora RLS).
    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from('site_meta').update({ publishing: true }).eq('id', 1);

    // 3. Disparar o rebuild no GitHub.
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'hd360-painel',
      },
      body: JSON.stringify({ event_type: EVENT_TYPE }),
    });

    if (!res.ok) {
      // Reverter a flag se o GitHub recusou.
      await admin.from('site_meta').update({ publishing: false }).eq('id', 1);
      return json({ error: `GitHub ${res.status}: ${await res.text()}` }, 502);
    }

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
