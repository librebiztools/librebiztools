import { FaCheck, FaPlus, FaTrash } from 'react-icons/fa';
import { Form, Link, data, href, redirect } from 'react-router';
import {
  acceptWorkspaceInvite,
  declinetWorkspaceInvite,
} from '~/api.server/auth';
import { ApiError } from '~/api.server/errors';
import { commitSession, getSession } from '~/api.server/session';
import { loginRedirect } from '~/api.server/utils';
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
    return redirect('/workspaces/new');
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
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="card w-full max-w-1/3 flex-shrink-0 bg-base-100 shadow-2xl">
          <div className="card-body">
            <h2 className="card-title">Workspaces</h2>
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
          </div>
        </div>

        {!!invites.length && (
          <div className="card w-full max-w-1/3 flex-shrink-0 bg-base-100 shadow-2xl">
            <div className="card-body">
              <h2 className="card-title">Pending Invites</h2>
              <ul className="w-full gap-2 pt-2">
                {invites.map((w) => (
                  <li key={w.name} className="bg-base-200 px-6 py-2 shadow-sm">
                    <div className="flex w-full flex-row items-center justify-between">
                      <span className="font-bold">{w.name}</span>
                      <div className="flex gap-2">
                        <Form method="post">
                          <input
                            type="hidden"
                            name="workspace-id"
                            value={w.id}
                          />
                          <input type="hidden" name="action" value="decline" />
                          <button
                            type="submit"
                            className="btn btn-sm btn-error"
                          >
                            <FaTrash /> Decline
                          </button>
                        </Form>
                        <Form method="post">
                          <input
                            type="hidden"
                            name="workspace-id"
                            value={w.id}
                          />
                          <input type="hidden" name="action" value="accept" />
                          <button
                            type="submit"
                            className="btn btn-sm btn-success"
                          >
                            <FaCheck /> Accept
                          </button>
                        </Form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <Link to="/workspaces/new" className="btn btn-primary">
            <FaPlus /> New Workspace
          </Link>
        </div>
      </div>
    </>
  );
}
