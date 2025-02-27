import { FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { FaPencil, FaShield } from 'react-icons/fa6';
import { data } from 'react-router';
import { getRoles } from '~/api.server/auth';
import { getSession } from '~/api.server/session';
import { loginRedirect } from '~/api.server/utils';
import type { Route } from './+types/workspaces.$slug.roles';

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const roles = await getRoles({ userId, slug: params.slug });

  return data({ roles });
}

export default function workspaceRoles({ loaderData }: Route.ComponentProps) {
  const { roles } = loaderData;

  return (
    <div>
      <h1 className="mb-2 text-2xl">
        <FaShield className="inline" /> Roles
      </h1>

      <hr className="mb-2" />

      <div className="flex w-full items-center justify-between">
        <div>
          <label className="input input-bordered flex items-center gap-2">
            <input type="text" className="grow" placeholder="Search" />
            <FaSearch />
          </label>
        </div>
        <div>
          <button className="btn btn-success" type="button">
            <FaPlus /> Add Role
          </button>
        </div>
      </div>

      <table className="table-zebra table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Permissions</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.role}>
              <td>{role.role}</td>
              <td>...</td>
              <td className="flex justify-end gap-2">
                <button className="btn btn-primary btn-outline" type="button">
                  <FaPencil /> Edit
                </button>
                <button className="btn btn-error btn-outline" type="button">
                  <FaTrash /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
