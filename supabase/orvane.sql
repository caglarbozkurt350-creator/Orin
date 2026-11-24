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

-- ---------------------------------------------------------------------------
-- 0.9.1 · Aile paylaşımı: eşin kendi hesabıyla ortak verileri görür.
-- Sahip (masaüstü) aile özetini orvane_aile'ye yayınlar; "uyeler" listesindeki e-postalar yalnız OKUR.
-- Üye yalnız izin verilen olay türlerini orvane_aile_olay'a yazar: kendi harcaması (cep harçlığı ya da ortak bütçe), gelir,
-- kendi ilaçları ve alındı işaretleri, takvim etkinliği / hastane randevusu, özel gün.
-- Sahibin iş kayıtları, izinleri, ilaçları vb. üye tarafından değiştirilemez: masaüstü bu tabloda başka tür işlemez.
create table if not exists public.orvane_aile (
  sahip uuid primary key default auth.uid() references auth.users on delete cascade,
  uyeler text[] not null default '{}',
  veri jsonb not null default '{}'::jsonb,
  ts timestamptz not null default now()
);
create table if not exists public.orvane_aile_olay (
  id text primary key,
  sira bigint generated always as identity,
  sahip uuid not null references auth.users on delete cascade,
  uye uuid not null default auth.uid() references auth.users on delete cascade,
  tur text not null check (tur in ('es_harcama', 'es_gelir', 'es_ilac_kaydet', 'es_ilac_sil', 'es_ilac_al', 'etkinlik', 'etkinlik_sil', 'ozel_gun', 'ozel_gun_sil')),
  veri jsonb not null default '{}'::jsonb,
  ts timestamptz not null default now()
);
create index if not exists orvane_aile_olay_sahip_sira on public.orvane_aile_olay (sahip, sira);

alter table public.orvane_aile enable row level security;
alter table public.orvane_aile_olay enable row level security;

drop policy if exists "aile sahibi" on public.orvane_aile;
create policy "aile sahibi" on public.orvane_aile for all to authenticated
  using (sahip = auth.uid()) with check (sahip = auth.uid());
drop policy if exists "aile uyesi okur" on public.orvane_aile;
create policy "aile uyesi okur" on public.orvane_aile for select to authenticated
  using (lower(auth.jwt() ->> 'email') = any (uyeler));

drop policy if exists "aile olayi yazar" on public.orvane_aile_olay;
create policy "aile olayi yazar" on public.orvane_aile_olay for insert to authenticated
  with check (uye = auth.uid() and exists (select 1 from public.orvane_aile a where a.sahip = orvane_aile_olay.sahip and lower(auth.jwt() ->> 'email') = any (a.uyeler)));
drop policy if exists "aile olayi okur" on public.orvane_aile_olay;
create policy "aile olayi okur" on public.orvane_aile_olay for select to authenticated
  using (sahip = auth.uid() or uye = auth.uid());
