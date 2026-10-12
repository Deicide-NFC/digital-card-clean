-- Product photos are stored in the existing profile-assets bucket.
-- Menu items are saved as JSON text; FAQ fields are editable per business profile.
alter table public.profiles add column if not exists faq1_question text;
alter table public.profiles add column if not exists faq1_answer text;
alter table public.profiles add column if not exists faq2_question text;
alter table public.profiles add column if not exists faq2_answer text;
alter table public.profiles add column if not exists faq3_question text;
alter table public.profiles add column if not exists faq3_answer text;
