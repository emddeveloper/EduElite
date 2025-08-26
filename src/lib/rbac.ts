import { Session } from "next-auth";
import { SessionUser } from "@/lib/auth";

export type Permission = {
  module: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export function isAdmin(session: Session | null): boolean {
  const u = (session as any)?.user as SessionUser | undefined;
  return u?.role === 'admin' && u?.isActive === true;
}

export function hasPermission(
  permissions: Permission[] | undefined,
  module: string,
  action: 'view' | 'edit' | 'delete' = 'view'
) {
  const p = permissions?.find((x) => x.module === module);
  if (!p) return false;
  if (action === 'view') return !!p.canView;
  if (action === 'edit') return !!p.canEdit;
  if (action === 'delete') return !!p.canDelete;
  return false;
}
