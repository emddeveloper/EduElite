"use client";

import { useSession } from "next-auth/react";

export default function AdminDashboardPage() {
  const { data } = useSession();
  const name = (data as any)?.user?.username || (data as any)?.user?.email;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-neutral-600 dark:text-neutral-300">Welcome {name}. Manage users, permissions, and modules.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="font-semibold mb-1">Users</div>
          <div className="text-sm text-neutral-600">Create, edit, enable/disable user accounts</div>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-1">Permissions</div>
          <div className="text-sm text-neutral-600">Assign modules and set view/edit/delete rights</div>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-1">Modules</div>
          <div className="text-sm text-neutral-600">Manage app modules and menu visibility</div>
        </div>
      </div>
    </div>
  );
}
