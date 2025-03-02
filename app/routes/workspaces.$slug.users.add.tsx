import { FaPlus, FaUndo } from 'react-icons/fa';
import { Form, data, redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { loginRedirect } from '~/.server/helpers';
import { ErrorAlert } from '~/components/error-alert';
import config from '~/config';
import type { Route } from './+types/workspaces.$slug.users.add';

export async function loader({ request, params }: Route.LoaderArgs) {
  const context = await getContext(request);
  const {
    session,
    services: { WorkspaceService },
  } = context;

  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const roles = await WorkspaceService.getRoles(
    { userId, slug: params.slug },
    context,
  );

  return data({
    roles,
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

  const formData = await request.formData();
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();
  const roleId = Number.parseInt(formData.get('role')?.toString() || '', 10);

  const result = await WorkspaceService.addUser(
    { userId, slug: params.slug, name, email, roleId },
    context,
  );
  if (result.isErr()) {
    return data({ error: result.error.message });
  }

  return redirect('..');
}

export default function workspaceAddUser({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { roles } = loaderData;
  const errorMessage = actionData?.error;

  return (
    <dialog className="modal" open={true}>
      <div className="modal-box">
        <h3 className="font-bold text-lg"> Add User </h3>
        <Form id="form-submit" method="post">
          <input type="hidden" name="action" value="add-user" />
          <fieldset className="fieldset">
            <label htmlFor="name" className="fieldset-label">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="input w-full"
              placeholder="Name"
              required
              maxLength={config.USER.MAX_NAME_LENGTH}
            />
            <label htmlFor="email" className="fieldset-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input w-full"
              placeholder="Email"
              required
            />
            <label htmlFor="role" className="fieldset-label">
              Role
            </label>
            <select id="role" name="role" className="select w-full">
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role}
                </option>
              ))}
            </select>
            {errorMessage && <ErrorAlert message={errorMessage} />}
          </fieldset>
          <div className="modal-action">
            <button type="submit" form="form-dismiss" className="btn">
              <FaUndo />
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FaPlus />
              Add User
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
