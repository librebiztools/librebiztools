import { FaCheck, FaUndo } from 'react-icons/fa';
import { Form, data, redirect } from 'react-router';
import { ApiError } from '~/api.server/errors';
import { loginRedirect } from '~/api.server/helpers';
import { commitSession, getSession } from '~/api.server/session';
import { getUserById, removeUser } from '~/api.server/users';
import { ErrorAlert } from '~/components/error-alert';
import type { Route } from './+types/workspaces.$slug.users.$id.remove';

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const removeUserId = Number.parseInt(params.id || '', 10);
  const removeUser = await getUserById(removeUserId);
  if (!removeUser) {
    session.flash('error', `User with id ${removeUserId} not found`);
    return redirect('.', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  return data({ removeUser });
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const removeUserId = Number.parseInt(params.id || '', 10);

  try {
    await removeUser({ userId, slug: params.slug, removeUserId });

    return redirect('..');
  } catch (err) {
    if (err instanceof ApiError) {
      return data({ error: err.message });
    }

    throw err;
  }
}

export default function workspaceRemoveUser({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const errorMessage = actionData?.error;
  const { removeUser } = loaderData;

  return (
    <dialog className="modal" open={true}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Remove User</h3>
        <Form id="form-submit" method="post">
          <p>
            {removeUser.name} will be removed from your workspace. All tickets
            assigned to them will be unassigned.
          </p>
          {errorMessage && <ErrorAlert message={errorMessage} />}
          <div className="modal-action">
            <button type="submit" form="form-dismiss" className="btn">
              <FaUndo />
              Cancel
            </button>
            <button type="submit" className="btn btn-error">
              <FaCheck />
              Yes, Remove {removeUser.name}
            </button>
          </div>
        </Form>
      </div>
      <Form
        id="form-dismiss"
        action=".."
        method="get"
        className="modal-backdrop backdrop-brightness-50"
      >
        <button type="submit">Close</button>
      </Form>
    </dialog>
  );
}
