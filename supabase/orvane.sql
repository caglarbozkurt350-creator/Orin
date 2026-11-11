-- Orvane · Supabase şeması (masaüstü + telefon eşitlemesi)
-- Supabase panelinde SQL Editor'a yapıştırıp Run'a bas. Tekrar çalıştırmak güvenlidir.
-- Telefon olay yazar (orvane_olay), masaüstü olayları işler ve güncel özeti yayınlar (orvane_durum).

create table if not exists public.orvane_olay (
  id text primary key,
  sira bigint generated always as identity,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kaynak text not null check (kaynak in ('telefon', 'masaustu')),
  tur text not null,
  veri jsonb not null default '{}'::jsonb,
  ts timestamptz not null default now()
);
create index if not exists orvane_olay_kullanici_sira on public.orvane_olay (user_id, sira);

create table if not exists public.orvane_durum (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  veri jsonb not null,
  ts timestamptz not null default now()
);

alter table public.orvane_olay enable row level security;
alter table public.orvane_durum enable row level security;

drop policy if exists "kendi olaylari" on public.orvane_olay;
create policy "kendi olaylari" on public.orvane_olay for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "kendi durumu" on public.orvane_durum;
create policy "kendi durumu" on public.orvane_durum for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 60 günden eski, özete işlenmiş olayları temizlemek için (isteğe bağlı, elle çalıştır):
-- delete from public.orvane_olay where ts < now() - interval '60 days';
