import { FaPlus, FaUndo } from 'react-icons/fa';
import { Form, data, redirect } from 'react-router';
import { addUser, getRoles } from '~/api.server/auth';
import { ApiError } from '~/api.server/errors';
import { getSession } from '~/api.server/session';
import { loginRedirect } from '~/api.server/utils';
import config from '~/config';
import type { Route } from './+types/workspaces.$slug.users.add';

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const roles = await getRoles({ userId, slug: params.slug });

  return data({
    roles,
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return loginRedirect(session, request.url);
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const roleId = Number.parseInt(formData.get('role')?.toString() || '', 10);

    await addUser({ userId, slug: params.slug, name, email, roleId });

    return redirect('..');
  } catch (err) {
    if (err instanceof ApiError) {
      return data({ error: err.message });
    }

    throw err;
  }
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
        <h3 className="font-bold text-lg">Add User</h3>
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
            {errorMessage && (
              <div role="alert" className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>Error</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{errorMessage}.</span>
              </div>
            )}
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
        <button type="submit">Close</button>
      </Form>
    </dialog>
  );
}
