import { slugify } from '~/utils';
import config from '../config';
import type { TransactionType } from '../db';
import { roles, userWorkspaceRoles, workspaces } from '../db/schema';

export async function createWorkspace({
  userId,
  name,
  tx,
}: {
  userId: number;
  name: string;
  tx: TransactionType;
}) {
  const slug = slugify(name, config.WORKSPACE.MAX_SLUG_LENGTH);
  const workspaceRows = await tx
    .insert(workspaces)
    .values({
      name,
      slug,
      createdBy: userId,
    })
    .returning({
      id: workspaces.id,
    });

  if (!workspaceRows || workspaceRows.length === 0) {
    throw new Error('Failed to insert workspace record');
  }

  const workspace = workspaceRows[0];

  const roleRows = await tx
    .insert(roles)
    .values([
      { workspaceId: workspace.id, role: 'Administrator', createdBy: userId },
      { workspaceId: workspace.id, role: 'Technician', createdBy: userId },
    ])
    .returning({
      id: roles.id,
      role: roles.role,
    });

  if (!roleRows || roleRows.length !== 2) {
    throw new Error('Failed to insert role records');
  }

  const adminRole = roleRows.find((r) => r.role === 'Administrator');
  if (!adminRole) {
    throw new Error('Could not find Administrator role');
  }

  await tx.insert(userWorkspaceRoles).values({
    userId,
    workspaceId: workspace.id,
    roleId: adminRole.id,
    createdBy: userId,
  });
}
