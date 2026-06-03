-- HD360 blog — Fase 2 / Plano 3: estado de publicação do site.
-- Aplicar no SQL Editor do projeto Supabase (uma vez).

create table if not exists public.site_meta (
  id                 integer primary key default 1,
  dirty              boolean not null default true,   -- há mudanças não publicadas
  publishing         boolean not null default false,  -- rebuild em andamento
  last_published_at  timestamptz,
  constraint site_meta_single_row check (id = 1)
);

insert into public.site_meta (id) values (1) on conflict (id) do nothing;

-- Qualquer escrita na tabela posts marca o site como "sujo" (precisa republicar).
create or replace function public.mark_site_dirty()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.site_meta set dirty = true where id = 1;
  return null;
end; $$;

drop trigger if exists posts_mark_site_dirty on public.posts;
create trigger posts_mark_site_dirty
  after insert or update or delete on public.posts
  for each statement execute function public.mark_site_dirty();

-- RLS: o painel (admin autenticado) lê o estado; ninguém anônimo lê.
-- Escrita só via service key (Edge Function e workflow), que ignora RLS.
alter table public.site_meta enable row level security;

drop policy if exists site_meta_read on public.site_meta;
create policy site_meta_read on public.site_meta
  for select to authenticated using (true);
