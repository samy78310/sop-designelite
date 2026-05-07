import { sql } from "@vercel/postgres";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import type { AdminUser } from "@/types";

async function getUsers(): Promise<AdminUser[]> {
  try {
    const { rows } = await sql`
      SELECT id, email, name, must_change_password, created_at
      FROM admin_users
      ORDER BY created_at DESC
    `;
    return rows as AdminUser[];
  } catch {
    return [];
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Utilisateurs admin</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez les accès à l&apos;interface d&apos;administration.
        </p>
      </div>
      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
