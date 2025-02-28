import { eq } from 'drizzle-orm';
import config from '../config';
import { type TransactionType, db } from '../db';
import { userWorkspaceRoles, users, workspaces } from '../db/schema';
import {
  INVITE_EXISTING_TEMPLATE_ID,
  INVITE_NEW_TEMPLATE_ID,
  getEmailTemplateId,
  sendEmail,
} from '../email';
import { InputError } from '../errors';

export async function sendInviteEmail({
  userId,
  slug,
  tx,
}: { userId: number; slug: string; tx: TransactionType }) {
  const roles = await (tx || db)
    .select({
      accepted: userWorkspaceRoles.accepted,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(userWorkspaceRoles)
    .innerJoin(workspaces, eq(workspaces.slug, slug))
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
        templateId: INVITE_EXISTING_TEMPLATE_ID,
        slug,
      }),
      vars: {
        accept_link: `${config.BASE_URL}/accept-invite?email=${encodeURIComponent(role.email)}`,
      },
      tx,
    });
  } else {
    await sendEmail({
      to: role.email,
      templateId: await getEmailTemplateId({
        templateId: INVITE_NEW_TEMPLATE_ID,
        slug,
      }),
      vars: {
        accept_link: `${config.BASE_URL}/signup?email=${encodeURIComponent(role.email)}`,
      },
      tx,
    });
  }
}
