// Redirect /admin → /admin/dashboard
import { redirect } from "next/navigation";

/** Default admin route redirects to dashboard */
export default function AdminPage() {
  redirect("/admin/dashboard");
}

