import {
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
import type { Route } from './+types/root';
import { getUserForRequest } from './api.server/auth';
import { ApiError } from './api.server/errors';
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

    return data(
      {
        error: session.get('error'),
        message: session.get('message'),
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
    <div className="toast toast-top top-10 animate-fade shadow-lg">
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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {user && !user.emailConfirmed && <EmailConfirmationAlert />}
        <div className="navbar bg-base-100 shadow-sm">
          <div className="flex-1">
            <Link className="btn btn-ghost text-xl" to="/">
              libreBizTools
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                {!user && <Link to="/login">Login</Link>}
                {user && (
                  <details>
                    <summary>{user.email}</summary>
                    <ul>
                      <li>
                        <Link to="/logout">Logout</Link>
                      </li>
                    </ul>
                  </details>
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
