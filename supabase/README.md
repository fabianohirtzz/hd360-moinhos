# Supabase — HD360 blog

## Aplicar o esquema
1. Criar projeto no Supabase (região mais próxima do BR).
2. SQL Editor → colar e rodar `schema.sql`.
3. Storage → criar bucket público `blog-images` (capa e imagens inline).
4. Authentication → criar 1 usuário (e-mail/senha) para o admin.

## Storage: policy de upload do painel (Fase 2)
O bucket `blog-images` é público para leitura, mas o **upload** (capa e imagens inline do editor) é feito pelo painel com o usuário autenticado, então precisa de policies de escrita para o role `authenticated`. Se o upload retornar 403, aplicar no SQL Editor:

```sql
-- Upload (insert) de objetos no bucket blog-images pelo admin autenticado.
create policy "blog-images authenticated insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-images');

-- (opcional) permitir trocar/remover a própria imagem.
create policy "blog-images authenticated update"
  on storage.objects for update to authenticated
  using (bucket_id = 'blog-images');
create policy "blog-images authenticated delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'blog-images');
```
A leitura pública já vem do bucket ser público; não precisa de policy de select.

## Chaves
- `anon key` → usada no painel (`/painel/`) e nas curtidas (pública por design).
- `service key` → segredo; só nas GitHub Actions e no seed local. Nunca no front.

## Env vars (build/seed local e CI)
- `SUPABASE_URL`   = https://<ref>.supabase.co
- `SUPABASE_SERVICE_KEY` = <service role key>

## Publicação (Plano 3)
- `publish.sql` cria `site_meta` (estado de publicação) e o trigger que marca o site como "sujo" a cada escrita em `posts`.
- A Edge Function `publish` (em `supabase/functions/publish/`) dispara o rebuild; secret necessário: `GITHUB_PAT` (fine-grained, repo `hd360-moinhos`, Contents: Read and write).
- O workflow `.github/workflows/publish-blog.yml` roda o build e atualiza `site_meta` ao terminar. Secrets do GitHub Actions: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
