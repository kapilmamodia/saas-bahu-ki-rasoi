// Auth layout for /admin/login — bare layout with NO auth check.
// This prevents the infinite redirect loop that happens when the main
// admin layout checks auth and redirects unauthenticated users to /admin/login,
// which would then re-trigger the same layout.
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth check — just render the login page as-is
  return <>{children}</>;
}

