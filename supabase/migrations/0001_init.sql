-- profiles: one row per user, the AI-extracted structured profile
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null check (source in ('chat','resume')),
  role_interest text not null default '',
  years_experience int not null default 0,
  experience_summary text not null default '',
  skills jsonb not null default '[]',
  notable_projects jsonb not null default '[]',
  preferences text not null default '',
  resume_storage_path text
);

-- matches: many rows per user, one batch per day
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_title text not null,
  reasoning text not null,
  pitch text,
  status text not null default 'new' check (status in ('new','applied','dismissed')),
  batch_date date not null default current_date,
  rank int not null,
  created_at timestamptz not null default now()
);

create index matches_user_batch_idx on public.matches (user_id, batch_date);
create index matches_user_status_idx on public.matches (user_id, status);

alter table public.profiles enable row level security;
alter table public.matches enable row level security;

create policy "profiles_owner_all" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "matches_owner_all" on public.matches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- storage: private resumes bucket, path convention `${user.id}/filename.pdf`
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resumes_owner_all" on storage.objects
  for all using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
