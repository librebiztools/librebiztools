import { FaCheck, FaUndo } from 'react-icons/fa';
import { Form, data, redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { errorRedirect, loginRedirect } from '~/.server/helpers';
import { ErrorAlert } from '~/components/error-alert';
import type { Route } from './+types/workspaces.$slug.users.$id.remove';

export async function loader({ request, params }: Route.LoaderArgs) {
  const context = await getContext(request);
  const {
    session,
    services: { UserService },
  } = context;

  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const removeUserId = Number.parseInt(params.id || '', 10);
  const removeUser = await UserService.getUserById(
    { id: removeUserId },
    context,
  );
  if (removeUser.isNone()) {
    return errorRedirect(session, 'User not found', '..');
  }

  return data({
    removeUser: removeUser.value,
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const context = await getContext(request);
  const {
    session,
    services: { WorkspaceService },
  } = context;

  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const removeUserId = Number.parseInt(params.id || '', 10);

  const result = await WorkspaceService.removeUser(
    { userId, slug: params.slug, removeUserId },
    context,
  );
  if (result.isErr()) {
    return data({ error: result.error.message });
  }

  return redirect('..');
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
        <h3 className="font-bold text-lg"> Remove User </h3>
        <Form id="form-submit" method="post">
          <p>
            {removeUser.name} will be removed from your workspace.All tickets
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
        <button type="submit"> Close </button>
      </Form>
    </dialog>
  );
}
