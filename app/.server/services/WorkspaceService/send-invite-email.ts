import { and, eq } from 'drizzle-orm';
import { Err, Ok, type Result } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { emailTemplates } from '~/.server/data';
import { type ApiError, InputError } from '~/.server/errors';

type Request = {
  userId: number;
  slug: string;
};

export async function sendInviteEmail(
  { userId, slug }: Request,
  context: Context,
): Promise<Result<void, ApiError>> {
  const {
    db,
    tx,
    schema: { userWorkspaceRoles, workspaces, users },
    services: { EmailService },
    config,
  } = context;

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
    return Err(new InputError('User does not belong to workspace'));
  }

  const role = roles[0];

  if (role.accepted) {
    return Err(new InputError('User already accepted invitation'));
  }

  const signedUp = !!role.passwordHash;
  if (signedUp) {
    const templateId = await EmailService.getEmailTemplateId(
      {
        typeId: emailTemplates.existingWorkspaceMemberInvitation.typeId,
        slug,
      },
      context,
    );

    if (templateId.isNone()) {
      return Err(new InputError('Email template not found'));
    }

    await EmailService.sendEmail(
      {
        to: role.email,
        templateId: templateId.value,
        vars: {
          name: role.name,
          login_link: `${config.BASE_URL}/workspaces`,
        },
      },
      context,
    );
  } else {
    const templateId = await EmailService.getEmailTemplateId(
      {
        typeId: emailTemplates.existingWorkspaceMemberInvitation.typeId,
        slug,
      },
      context,
    );

    if (templateId.isNone()) {
      return Err(new InputError('Email template not found'));
    }

    await EmailService.sendEmail(
      {
        to: role.email,
        templateId: templateId.value,
        vars: {
          name: role.name,
          signup_link: `${config.BASE_URL}/signup?email=${encodeURIComponent(
            role.email,
          )}`,
        },
      },
      context,
    );
  }

  return Ok.EMPTY;
}
