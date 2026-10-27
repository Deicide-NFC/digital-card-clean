NFC Digital Card – feature/card-order-phase1 update

Files in this patch:
- src/app/order/CardOrderBuilder.tsx
  Makes the Company / personal brand logo upload available for BOTH Personal ID and Business ID orders. The existing API already saves `design.companyLogo` to Supabase Storage and includes its URL in the order design.
- src/app/admin/(dashboard)/orders/page.tsx
  Adds Active orders, Completed, and All orders tabs. Marking an order Completed does NOT delete it; it remains in Supabase and appears under Completed. No automatic deletion is introduced.

Apply only to branch: feature/card-order-phase1
Do not merge/deploy to main/Production unless you choose to.

Browser-only apply:
1. Open your GitHub repository and switch to `feature/card-order-phase1`.
2. Open each listed file and click the pencil (Edit this file).
3. Replace the entire file contents with the matching file from this ZIP, then commit the changes directly to `feature/card-order-phase1`.
   For the nested orders page, the path is `src/app/admin/(dashboard)/orders/page.tsx`.
4. Wait for the Vercel Preview deployment to finish.
5. Test `/order` with Personal ID and confirm the optional logo uploader appears. Submit a test order only if you want to test storage; uploads use your configured `profile-assets` bucket.
6. Open `/admin/orders`, mark a test order Completed, save, then select Completed. It should remain visible there.

Note: This patch does not add a delete button or delete any order/assets. Completed orders are retained for your records.
