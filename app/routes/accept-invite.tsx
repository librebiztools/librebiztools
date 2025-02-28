import { FaCheck, FaTrash } from 'react-icons/fa';
import { Form, data, redirect } from 'react-router';
import {
  acceptWorkspaceInvite,
  declinetWorkspaceInvite,
  getWorkspaceInvitesForUserId,
} from '~/api.server/auth';
import { ApiError } from '~/api.server/errors';
import { commitSession, getSession } from '~/api.server/session';
import { loginRedirect } from '~/api.server/utils';
import type { Route } from './+types/accept-invite';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const invites = await getWorkspaceInvitesForUserId(userId);
  if (!invites.length) {
    return redirect('/workspaces');
  }

  return data({ invites });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const formData = await request.formData();
  const action = formData.get('action')?.toString() || '';
  const workspaceId = Number.parseInt(
    formData.get('workspace-id')?.toString() || '',
    10,
  );

  try {
    switch (action) {
      case 'decline':
        await declinetWorkspaceInvite({ userId, workspaceId });
        break;
      case 'accept':
        await acceptWorkspaceInvite({ userId, workspaceId });
        break;
    }
  } catch (err) {
    if (err instanceof ApiError) {
      session.flash('error', err.message);
      return data(
        {},
        {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        },
      );
    }

    throw err;
  }
}

export default function acceptInvite({ loaderData }: Route.ComponentProps) {
  const { invites } = loaderData;

  return (
    <>
      <h1 className="my-2 w-full text-center text-2xl">
        Pending Workspace Invitations
      </h1>
      <div className="flex justify-center">
        <div className="max-h-screen w-full max-w-xl space-y-4 overflow-y-auto p-4">
          {invites.map((i) => (
            <div key={i.workspace} className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">{i.workspace}</h2>
                <p>Invited by {i.invitedBy}</p>
                <div className="mt-6 flex gap-2">
                  <Form method="post">
                    <input
                      type="hidden"
                      name="workspace-id"
                      value={i.workspaceId}
                    />
                    <input type="hidden" name="action" value="decline" />
                    <button type="submit" className="btn btn-error">
                      <FaTrash /> Decline
                    </button>
                  </Form>
                  <Form method="post">
                    <input
                      type="hidden"
                      name="workspace-id"
                      value={i.workspaceId}
                    />
                    <input type="hidden" name="action" value="accept" />
                    <button type="submit" className="btn btn-success">
                      <FaCheck /> Accept
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
