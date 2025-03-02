import { and, eq } from 'drizzle-orm';
import { Err, Ok, type Result } from 'ts-results-es';
import type { Context } from '~/.server/context';
import { type ApiError, InputError } from '~/.server/errors';

type Request = {
  userId: number;
  workspaceId: number;
};

export async function acceptWorkspaceInvite(
  { userId, workspaceId }: Request,
  context: Context,
): Promise<Result<void, ApiError>> {
  if (Number.isNaN(userId)) {
    return Err(new InputError(`Invalid userId ${userId}`));
  }

  if (Number.isNaN(workspaceId)) {
    return Err(new InputError(`Invalid workspaceId ${workspaceId}`));
  }

  const {
    db,
    tx,
    schema: { userWorkspaceRoles },
  } = context;

  const role = await (tx || db).query.userWorkspaceRoles.findFirst({
    columns: {
      accepted: true,
    },
    where: and(
      eq(userWorkspaceRoles.userId, userId),
      eq(userWorkspaceRoles.workspaceId, workspaceId),
    ),
  });

  if (!role) {
    return Err(
      new InputError('Could not find pending invite for that workspace'),
    );
  }

  if (role.accepted) {
    return Err(new InputError('Invite already accepted'));
  }

  await db
    .update(userWorkspaceRoles)
    .set({ accepted: true })
    .where(
      and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.workspaceId, workspaceId),
      ),
    );

  return Ok.EMPTY;
}
