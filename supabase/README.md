# Supabase — HD360 blog

## Aplicar o esquema
1. Criar projeto no Supabase (região mais próxima do BR).
2. SQL Editor → colar e rodar `schema.sql`.
3. Storage → criar bucket público `blog-images` (capa e imagens inline).
4. Authentication → criar 1 usuário (e-mail/senha) para o admin.

## Chaves
- `anon key` → usada no painel (`/painel/`) e nas curtidas (pública por design).
- `service key` → segredo; só nas GitHub Actions e no seed local. Nunca no front.

## Env vars (build/seed local e CI)
- `SUPABASE_URL`   = https://<ref>.supabase.co
- `SUPABASE_SERVICE_KEY` = <service role key>
