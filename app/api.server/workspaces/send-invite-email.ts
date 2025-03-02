import { and, eq } from 'drizzle-orm';
import config from '../config';
import { type TransactionType, db } from '../db';
import { userWorkspaceRoles, users, workspaces } from '../db/schema';
import { getEmailTemplateId, sendEmail, templates } from '../email';
import { InputError } from '../errors';

export async function sendInviteEmail({
  userId,
  slug,
  tx,
}: { userId: number; slug: string; tx: TransactionType }) {
  const roles = await (tx || db)
    .select({
      accepted: userWorkspaceRoles.accepted,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(userWorkspaceRoles)
    .innerJoin(
      workspaces,
      and(
        eq(workspaces.id, userWorkspaceRoles.workspaceId),
        eq(workspaces.slug, slug),
      ),
    )
    .innerJoin(users, eq(users.id, userWorkspaceRoles.userId))
    .where(eq(userWorkspaceRoles.userId, userId));

  if (!roles || roles.length === 0) {
    throw new InputError('User does not belong to workspace');
  }

  const role = roles[0];

  if (role.accepted) {
    throw new InputError('User already accepted invitation');
  }

  const signedUp = !!role.passwordHash;
  if (signedUp) {
    await sendEmail({
      to: role.email,
      templateId: await getEmailTemplateId({
        typeId: templates.existingWorkspaceMemberInvitation.typeId,
        slug,
        tx,
      }),
      vars: {
        name: role.name,
        login_link: `${config.BASE_URL}/workspaces`,
      },
      tx,
    });
  } else {
    await sendEmail({
      to: role.email,
      templateId: await getEmailTemplateId({
        typeId: templates.newWorkspaceMemberInvitation.typeId,
        slug,
        tx,
      }),
      vars: {
        name: role.name,
        signup_link: `${config.BASE_URL}/signup?email=${encodeURIComponent(role.email)}`,
      },
      tx,
    });
  }
}
