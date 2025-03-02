import { and, eq } from 'drizzle-orm';
import { Err, Ok, type Result } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { emailTemplates } from '~/.server/data';
import { type ApiError, InputError } from '~/.server/errors';

// TODO: permissions

type Request = {
  userId: number;
  slug: string;
  removeUserId: number;
};

export async function removeUser(
  { slug, removeUserId }: Request,
  context: Context,
): Promise<Result<void, ApiError>> {
  if (Number.isNaN(removeUserId)) {
    return Err(new InputError('Invalid user id'));
  }

  const {
    db,
    tx,
    schema: { userWorkspaceRoles, users },
    services: { EmailService, WorkspaceService },
  } = context;

  const workspace = await WorkspaceService.getWorkspaceBySlug(
    { slug },
    context,
  );

  if (workspace.isNone()) {
    return Err(new InputError(`Workspace ${slug} does not exist`));
  }

  const rows = await (tx || db)
    .select({ id: users.id, email: users.email, name: users.name })
    .from(userWorkspaceRoles)
    .innerJoin(
      users,
      and(eq(users.id, removeUserId), eq(users.id, userWorkspaceRoles.userId)),
    )
    .where(eq(userWorkspaceRoles.workspaceId, workspace.value.id));

  if (rows.length === 0) {
    return Err(new InputError('User is not a member of this workspace'));
  }

  const removeUser = rows[0];

  await db.transaction(async (tx) => {
    await tx
      .delete(userWorkspaceRoles)
      .where(
        and(
          eq(userWorkspaceRoles.userId, removeUserId),
          eq(userWorkspaceRoles.workspaceId, workspace.value.id),
        ),
      );

    const templateId = await EmailService.getEmailTemplateId(
      {
        slug,
        typeId: emailTemplates.workspaceMemberRemoval.typeId,
      },
      { ...context, tx },
    );

    if (templateId.isNone()) {
      return Err(new InputError('Email template not found'));
    }

    await EmailService.sendEmail(
      {
        to: removeUser.email,
        templateId: templateId.value,
        vars: {
          name: removeUser.name,
          workspace_name: workspace.value.name,
        },
      },
      { ...context, tx },
    );
  });

  return Ok.EMPTY;
}
