import { redirect } from "next/navigation";
import { isAdminEmail } from "./admin-email";
import { createSessionClient } from "./supabase/server";

/** Returns the signed-in admin, or null. Verifies the token with Supabase (not just the cookie). */
export async function getAdminUser() {
  try {
    const supabase = createSessionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && isAdminEmail(user.email)) return user;
  } catch {
    // fall through
  }
  return null;
}

/** For pages: redirect to the login screen when not an admin. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
