import { FaCheck, FaTrash } from 'react-icons/fa';
import { Form, Link, data, href, redirect } from 'react-router';
import {
  acceptWorkspaceInvite,
  declinetWorkspaceInvite,
} from '~/api.server/auth';
import { ApiError } from '~/api.server/errors';
import { commitSession, getSession } from '~/api.server/session';
import { errorRedirect, loginRedirect } from '~/api.server/utils';
import { getWorkspacesForUser } from '~/api.server/workspace';
import type { Route } from './+types/workspaces._index';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session);
  }

  const workspaces = await getWorkspacesForUser({ userId });
  if (!workspaces.length) {
    return errorRedirect(session, "You don't belong to any workspaces");
  }

  if (workspaces.length === 1) {
    return redirect(`/workspaces/${workspaces[0].slug}`);
  }

  return data({ workspaces });
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

export default function workspaces({ loaderData }: Route.ComponentProps) {
  const { workspaces } = loaderData;

  const activeWorkspaces = workspaces.filter((w) => w.accepted);
  const invites = workspaces.filter((w) => !w.accepted);

  return (
    <>
      <h1 className="my-2 w-full text-center text-2xl">Workspaces</h1>
      <div className="flex justify-center">
        <div className="max-h-screen w-full max-w-xl space-y-4 overflow-y-auto p-4">
          {!!activeWorkspaces.length && (
            <ul className="menu menu-xl w-full gap-2">
              {activeWorkspaces.map((w) => (
                <li key={w.name} className="bg-base-200 shadow-sm">
                  <Link to={href('/workspaces/:slug', { slug: w.slug })}>
                    {w.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!!invites.length && (
            <h1 className="my-2 w-full text-center text-2xl">
              Pending Invites
            </h1>
          )}
          {invites.map((w) => (
            <div key={w.name} className="card bg-base-200 shadow-sm">
              <div className="card-body flex w-full flex-row items-center justify-between">
                <h2 className="card-title">{w.name}</h2>
                <div className="flex gap-2">
                  <Form method="post">
                    <input type="hidden" name="workspace-id" value={w.id} />
                    <input type="hidden" name="action" value="decline" />
                    <button type="submit" className="btn btn-sm btn-error">
                      <FaTrash /> Decline
                    </button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="workspace-id" value={w.id} />
                    <input type="hidden" name="action" value="accept" />
                    <button type="submit" className="btn btn-sm btn-success">
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
