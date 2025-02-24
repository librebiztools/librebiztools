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

import type { Route } from './+types/root';
import { getUserForRequest } from './api.server/auth';
import { ApiError } from './api.server/errors';
import type { User } from './api/user';
import stylesheet from './app.css?url';

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const user = await getUserForRequest(request);
    return data(user);
  } catch (err) {
    if (err instanceof ApiError) {
      return data({ message: err.message }, { status: err.code });
    }
    throw err;
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const user = useRouteLoaderData<User | null>('root');
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
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
