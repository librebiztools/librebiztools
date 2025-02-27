import { FaPlus, FaSearch, FaTrash, FaUsers } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { data } from 'react-router';
import { getUsers } from '~/api.server/auth';
import { getSession } from '~/api.server/session';
import { loginRedirect } from '~/api.server/utils';
import type { Route } from './+types/workspaces.$slug.users';

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const users = await getUsers({ userId, slug: params.slug });

  return data({ users });
}

export default function workspaceUsers({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <div>
      <h1 className="mb-2 text-2xl">
        <FaUsers className="inline" /> Users
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
            <FaPlus /> Add User
          </button>
        </div>
      </div>

      <table className="table-zebra table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
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
