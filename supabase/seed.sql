-- =====================================================================
-- Demo data: 3 sample profiles. Run AFTER schema.sql.
-- No photos are set, so the card shows a generated initials avatar.
-- Safe to run more than once.
-- =====================================================================
insert into public.profiles
  (profile_id, full_name, job_title, company, bio, phone, email, website,
   facebook, instagram, tiktok, linkedin, messenger, whatsapp, viber,
   address, maps_url, business_hours, theme, primary_color, background, button_style)
values
(
  'charles01', 'Charles Arthur Salamat', 'Assistant Restaurant Manager', 'Red Ribbon',
  'Hospitality professional focused on guest experience, team coaching and smooth restaurant operations.',
  '+63 917 123 4567', 'charles@example.com', 'https://www.redribbonbakeshop.com',
  'charles.salamat', 'charles.salamat', null, 'charles-salamat', 'charles.salamat', '+63 917 123 4567', '+63 917 123 4567',
  'SM City Branch, Quezon City, Metro Manila, Philippines',
  'https://maps.google.com/?q=SM+City+North+EDSA',
  E'Mon to Sun: 9:00 AM to 9:00 PM',
  'light', '#D6193A', 'gradient', 'rounded'
),
(
  'juan01', 'Juan Dela Cruz', 'Business Owner', 'Juan''s Cafe',
  'Small-batch coffee, fresh pastries and a corner table with your name on it. Walk-ins and catering orders welcome.',
  '+63 918 555 0101', 'hello@juanscafe.example', 'https://juanscafe.example',
  'juanscafe', 'juanscafe', 'juanscafe', null, 'juanscafe', '+63 918 555 0101', null,
  '12 Mabini Street, Cebu City, Philippines',
  'https://maps.google.com/?q=Cebu+City',
  E'Mon to Fri: 7:00 AM to 7:00 PM\nSat to Sun: 8:00 AM to 5:00 PM',
  'dark', '#E0A526', 'mesh', 'pill'
),
(
  'maria01', 'Maria Santos', 'Marketing Manager', 'ABC Corporation',
  'I help brands tell clearer stories across digital, events and partnerships.',
  '+63 920 777 0202', 'maria.santos@abc.example', 'https://abc.example',
  null, 'maria.santos', null, 'maria-santos', null, '+63 920 777 0202', null,
  'Ayala Avenue, Makati City, Philippines',
  null,
  E'Mon to Fri: 9:00 AM to 6:00 PM',
  'auto', '#0F766E', 'dots', 'square'
)
on conflict (lower(profile_id)) do nothing;
