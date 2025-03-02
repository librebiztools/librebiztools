import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  isRouteErrorResponse,
  useRouteLoaderData,
} from 'react-router';

import { useEffect, useState } from 'react';
import { FaBell, FaMoon, FaSignOutAlt, FaSun, FaUser } from 'react-icons/fa';
import { FaPeopleGroup } from 'react-icons/fa6';
import type { Route } from './+types/root';
import { getUserForRequest } from './api.server/auth';
import { ApiError } from './api.server/errors';
import { getPreferences } from './api.server/preferences';
import { commitSession, getSession } from './api.server/session';
import type { User } from './api/user';
import stylesheet from './app.css?url';
import { EmailConfirmationAlert } from './components/email-confirmation-alert';

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const user = await getUserForRequest(request);
    const session = await getSession(request.headers.get('Cookie'));
    const preferences = await getPreferences(request.headers.get('Cookie'));

    return data(
      {
        error: session.get('error'),
        message: session.get('message'),
        theme: preferences.get('theme') || 'light',
        dismissedEmailConfirmation:
          session.get('dismissedEmailConfirmation') || false,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              emailConfirmed: user.emailConfirmed,
            }
          : null,
      },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return data({ message: err.message }, { status: err.code });
    }
    throw err;
  }
}

type RootLoaderData = {
  user: User | null;
  error: string | undefined;
  message: string | undefined;
  theme: 'light' | 'dark';
  dismissedEmailConfirmation: boolean;
};

const Toast = ({
  message,
  type,
  onClose,
}: { message: string; type: 'info' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [onClose]);

  return (
    <div className="toast toast-top top-10 z-50 animate-fade shadow-lg">
      <div className={`alert alert-${type}`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<RootLoaderData | undefined>('root');
  const user = data?.user;
  const [errorToast, setErrorToast] = useState(data?.error);
  const [messageToast, setMessageToast] = useState(data?.message);

  return (
    <html lang="en" data-theme={data?.theme || 'light'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {user && !user.emailConfirmed && !data?.dismissedEmailConfirmation && (
          <EmailConfirmationAlert />
        )}
        <div className="navbar bg-base-100 shadow-sm">
          <div className="flex-1">
            <Link className="btn btn-ghost text-xl" to="/">
              Tickflo
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Form method="post" action="/toggle-theme">
                  <button type="submit" className="pt-1">
                    {data?.theme === 'dark' ? (
                      <FaMoon className="cursor-pointer" />
                    ) : (
                      <FaSun className="cursor-pointer" />
                    )}
                  </button>
                </Form>
              </li>
              <li>
                <Link to="/notifications">
                  <FaBell />
                  Inbox
                  <span className="badge badge-xs badge-primary">99+</span>
                </Link>
              </li>
              <li>
                {!user && <Link to="/login">Login</Link>}
                {user && (
                  <div className="dropdown dropdown-end">
                    {/*biome-ignore lint/a11y/useSemanticElements: reason required for safari*/}
                    <div tabIndex={0} role="button">
                      {user.email}
                    </div>
                    <ul className="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
                      <li>
                        <Link
                          to="/profile"
                          onClick={(e) => e.currentTarget.blur()}
                        >
                          <FaUser /> Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/workspaces"
                          onClick={(e) => e.currentTarget.blur()}
                        >
                          <FaPeopleGroup /> Workspaces
                        </Link>
                      </li>
                      <li>
                        <form method="post" action="/logout">
                          <button type="submit" className="cursor-pointer">
                            <FaSignOutAlt className="mr-2 inline" />
                            Logout
                          </button>
                        </form>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
        {errorToast && (
          <Toast
            type="error"
            message={errorToast}
            onClose={() => setErrorToast('')}
          />
        )}
        {messageToast && (
          <Toast
            type="info"
            message={messageToast}
            onClose={() => setMessageToast('')}
          />
        )}
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
