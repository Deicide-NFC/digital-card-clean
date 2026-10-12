# NFC Digital Business Card

One web app that serves unlimited digital business cards. Each customer gets a permanent address such as `https://yourdomain.com/c/charles01`. That address is written to an NTAG215 NFC card and printed as a QR code. Edit the profile any time and the same card and QR code show the new details.

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Postgres, Auth, Storage). Deploys to Vercel.

## How it works

```
NFC card  ->  https://DOMAIN/c/charles01  <-  QR code
                       |
              Next.js server reads the profile from Supabase
                       |
        Active: card page      Disabled: "currently unavailable"
```

- `profiles` holds every customer. `profile_type` supports Personal ID and Business ID cards. `profile_id` is unique and is the permanent part of the URL.
- `profile_stats` holds privacy-friendly counters (views, saves, clicks). No IP addresses or device data.
- Row Level Security is on with no public policies. Browsers can never read tables directly. The server uses the service-role key, and only active profiles are ever rendered publicly.
- Admin access needs a Supabase login AND an email listed in `ADMIN_EMAILS`. It is checked in middleware, in the admin layout, and inside every server action.

## Project structure

```
supabase/schema.sql          Tables, indexes, constraints, RLS, storage bucket
supabase/seed.sql            3 demo profiles
middleware.ts                Blocks /admin/* unless signed in as an admin
src/app/c/[profileId]/       Public card page + /vcard download route
src/app/go/[profileId]/[platform]/ Stable redirect URLs for individual social QR codes
src/app/api/track/           Counter endpoint (no personal data)
src/app/admin/               Login + dashboard (overview, customers, QR, NFC guide, settings)
src/app/admin/actions.ts     All admin writes (create, update, enable/disable, duplicate, delete)
src/components/profile/      The public card design
src/components/admin/        Dashboard UI, customer form with live preview, QR panel
src/lib/                     Validation, vCard builder, link builders, Supabase clients
```

## Local setup

1. **Create a Supabase project** at supabase.com (free tier is fine).
2. **Create the database:** SQL Editor > New query > paste `supabase/schema.sql` > Run.
3. **Optional demo data:** run `supabase/seed.sql` the same way.
4. **Create your admin account:** Authentication > Users > Add user > Create new user. Enter your email and a strong password, and tick "Auto confirm user".
5. **Block public sign-ups:** Authentication > Sign In / Providers > turn off "Allow new users to sign up". (The `ADMIN_EMAILS` list already stops strangers, this is a second lock.)
6. **Copy the keys:** Project Settings > API (or API Keys). You need the Project URL, the anon key and the service_role key.
7. **Configure the app:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `.env.local`. Set `ADMIN_EMAILS` to the email from step 4.
8. **Run it:**
   ```bash
   npm install
   npm run dev
   ```
9. Open http://localhost:3000/admin and sign in. Open http://localhost:3000/c/charles01 for the sample card (if you ran the seed).

### Environment variables

| Variable | Public? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key (used only for admin sign-in) |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | Server-only database and storage access. Never expose it. |
| `ADMIN_EMAILS` | secret | Comma-separated emails allowed into `/admin` |
| `NEXT_PUBLIC_SITE_URL` | yes | Your real domain, no trailing slash. Used for QR codes and card URLs. |
| `NEXT_PUBLIC_BRAND_NAME` | yes | Name shown in the admin and card footer |

## Existing Supabase database: premium themes update

If this project is already deployed with an existing Supabase database, run
`supabase/migrations/20261010_add_premium_design_themes.sql` and `supabase/migrations/20261011_add_business_menu.sql` in **Supabase → SQL Editor**, in that order.
This adds the premium `design_theme`, `profile_type`, and `business_name` columns without changing
existing profiles. Existing cards remain personal and use the Classic design by default. The
Light / Dark / Match phone preference continues to work.

## Deploy to Vercel

1. Push this folder to a GitHub repository (`.env.local` is git-ignored).
2. In Vercel: Add New > Project > import the repo. Framework is detected automatically.
3. Add all six environment variables above. Set `NEXT_PUBLIC_SITE_URL` to your final domain.
4. Deploy. Then add your domain under Settings > Domains and update DNS as Vercel instructs.
5. **Before you print or write any card**, make sure `NEXT_PUBLIC_SITE_URL` is your final domain. Redeploy after changing it. QR codes use this value, and NFC cards are written with it.

Any Node host works too (`npm run build && npm start`).

## Selling your first card: checklist

- [ ] Schema applied in Supabase, admin user created, sign-ups disabled
- [ ] Deployed, with your real domain and `NEXT_PUBLIC_SITE_URL` set to it
- [ ] Settings page in the admin shows all green checks
- [ ] Delete or disable the 3 demo profiles
- [ ] Create a test customer and run the NFC and QR tests below on an iPhone AND an Android phone
- [ ] Test "Save contact" on both phones
- [ ] Test disabling a card and confirm the "unavailable" message
- [ ] Decide on your domain for the long term. Cards written today carry it forever.

## Creating a customer or business card

1. Admin > **Add customer**.
2. Choose **Personal ID** or **Business ID**. Personal ID starts with the saved project-owner details (Charles Arthur Salamat, Assistant Restaurant Manager, Red Ribbon, phone, email, and Facebook) so they can be reviewed and edited before saving. Switching a new profile to Business ID clears those personal details to avoid accidentally publishing them.
3. For Business ID, enter the business/brand name and the contact person's name, then fill in contact and social links. A Profile ID is suggested from the personal name or business name. You can change it before saving. **It cannot be changed afterwards**, because it is printed on the card.
4. Choose one of the available designs: Classic, Obsidian Gold, Royal Prestige, Ivory Minimal, Emerald Luxe, Titanium, or Artisan Classic. Light / Dark / Match phone and other design controls remain available.
5. Click **Create profile**. You land on the QR page with the permanent URL, ready to print and write.
6. For a Business ID, each social or messaging platform you filled in gets its own QR code on that QR page. Download each code as PNG or SVG. The QR encodes a stable redirect such as `/go/charlesbusiness/facebook`, so changing the destination later does not require reprinting the QR.

## Writing a card (NTAG215)

1. Open the customer's QR page and tap **Copy URL**.
2. Install NFC Tools (iPhone or Android). Open Write > Add a record > URL / URI.
3. Paste the full address (`https://...`), tap Write, and hold the phone to the card.
4. **Test NFC:** lock the phone, wake it, and tap the card. The profile should open. iPhone XS and newer read tags in the background. On Android, NFC must be turned on.
5. **Test QR:** scan the printed code with the normal camera app.
6. Locking the tag is optional and permanent. Only lock after testing.

## Updating a customer

Edit them in the admin and click **Save changes**. The card is dynamic, so the NFC card and QR code keep working with the new details. Nothing needs to be rewritten.

## Disabling and deleting

- **Disable** (power icon): visitors see "This digital business card is currently unavailable." No customer data is shown. Enable it again any time.
- **Delete**: removes the profile, its stats and its images permanently.

## Save Contact (vCard)

The button downloads `/c/<id>/vcard`, a vCard 3.0 file with only the fields that exist (name, company, title, phone, email, website, address, bio, and the photo when it is small enough). iPhone opens the native Add Contact sheet. Android downloads the `.vcf` and opens it in Contacts. Android browsers vary a little, so test on your own phone.

## Analytics (privacy-conscious)

Per profile: views, last viewed, contact saves, calls, emails, messages, website, social and map clicks. Only counters are stored. A view is counted once per browser tab session. The counter endpoint is open, so a determined person could inflate numbers. Treat them as indicative.

## Built for later

The schema and code are organised so these can be added without a rewrite:

- **Customer login / self-editing:** add an `owner_id uuid references auth.users` to `profiles`, then add RLS policies and a `/account` area. The edit form can be reused.
- **Subscriptions and expiry:** add `plan` and `expires_at` columns, and treat expired like `disabled` inside `getPublicProfile`.
- **Multiple cards per customer, companies and employee cards:** add `customers` / `organizations` tables and point `profiles` at them.
- **Custom domains:** resolve the host header in middleware and look up the profile by domain.
- **Inventory, orders, payments:** new tables and admin pages. Nothing in the public card depends on them.

## Notes and limits

- Profile photos are cropped and compressed in the browser before upload (max about 640px). Logos are PNG up to 480px.
- Public cards are `noindex` by default so they are shared by tap and scan rather than found on Google.
- Dependencies were not installed or built in the environment where this code was written. Run `npm install && npm run build` once locally and fix anything your version of Node flags before deploying.


## Business menu and ordering

For a Business ID, edit the profile in Admin and use the **Restaurant menu & ordering** field. Add one menu item per line in this format:

```text
Chicken Inasal | 180 | Served with rice
Pancit Canton | 150 | Good for one
Iced Tea | 45 | 16 oz
```

The item name and numeric price are required; the description is optional. After saving a business profile with at least one valid menu line, its public card shows **Order Now**, which opens `/c/<profile_id>/order`. Customers select quantities and enter their name, phone, pickup/delivery choice, and optional notes. The order is prepared as a message, copied to the clipboard, and the configured Messenger/Facebook contact opens so the customer can paste and send it. Orders are not stored or automatically transmitted by this website; the business must confirm the order in chat.

Before using the menu feature on an existing Supabase project, run `supabase/migrations/20261011_add_business_menu.sql` in the Supabase SQL Editor.


## Business ID product menu and FAQs

- Run `supabase/migrations/20261011_add_business_menu_photos_faqs.sql` once in Supabase SQL Editor after deploying the code.
- In Admin > Customers > edit a Business ID, use **Restaurant menu & ordering** to add up to 30 products. Each product supports a photo, name, short description, and price. Photos are compressed in the browser and stored in the existing `profile-assets` Supabase Storage bucket when saved.
- Fill any of the three FAQ question/answer pairs to show them near the bottom of the Business ID. Leave a pair blank to hide it.
- Customers can choose quantities, enter their contact information, select a needed date and time, choose pickup or delivery, and prepare the order for Messenger. Orders are not automatically submitted or saved to a database; the customer must paste/send the prepared message and the business confirms it in chat.
