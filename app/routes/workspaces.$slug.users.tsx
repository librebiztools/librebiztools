import { FaEnvelope, FaPlus, FaSearch, FaTrash, FaUsers } from 'react-icons/fa';
import { FaBoltLightning, FaPencil, FaPerson, FaShield } from 'react-icons/fa6';
import { Link, Outlet, data } from 'react-router';
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
    <>
      <div>
        <h1 className="mb-2 text-2xl">
          <FaUsers className="inline" /> Users
        </h1>

        <hr className="mb-2" />

        <div className="mb-2 flex w-full items-center justify-between">
          <div>
            <label className="input input-bordered flex items-center gap-2">
              <input type="text" className="grow" placeholder="Search" />
              <FaSearch />
            </label>
          </div>
          <div>
            <Link to="./add" className="btn btn-primary btn-sm">
              <FaPlus /> Add User
            </Link>
          </div>
        </div>

        <table className="table-zebra table">
          <thead>
            <tr>
              <th> </th>
              <th>
                <FaPerson className="inline pb-1" /> Name
              </th>
              <th>
                <FaEnvelope className="inline pb-1" /> Email
              </th>
              <th>
                <FaShield className="inline pb-1" /> Role
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="dropdown">
                    {/*biome-ignore lint/a11y/useSemanticElements: reason required for safari*/}
                    <div tabIndex={0} role="button" className="btn btn-sm">
                      <FaBoltLightning /> Actions
                    </div>
                    <ul className="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
                      <li>
                        <Link to="./edit">
                          <FaPencil /> Edit
                        </Link>
                      </li>
                      {!user.inviteAccepted && (
                        <li>
                          <Link to="./resend-invite">
                            <FaEnvelope /> Resend Invite
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link to="./remove" className="text-error">
                          <FaTrash /> Remove
                        </Link>
                      </li>
                    </ul>
                  </div>
                </td>
                <td>{user.name}</td>
                <td>
                  {user.email}
                  {!user.inviteAccepted && (
                    <div className="badge badge-soft badge-info ml-1">
                      Invited
                    </div>
                  )}
                </td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Outlet />
    </>
  );
}
