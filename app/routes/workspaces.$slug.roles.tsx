import { FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { FaPencil, FaShield } from 'react-icons/fa6';
import { data } from 'react-router';
import { AuthError } from '~/.server/errors';
import { getRoles } from '~/.server/services/workspace';
import { appContext } from '~/app-context';
import type { Route } from './+types/workspaces.$slug.roles';

export async function loader({ context, params }: Route.LoaderArgs) {
  const ctx = context.get(appContext);
  const { user } = ctx;

  if (user.isNone()) {
    throw new AuthError('User not found');
  }

  const roles = await getRoles(
    { userId: user.value.id, slug: params.slug },
    ctx,
  );

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
