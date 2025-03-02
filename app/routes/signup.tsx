import { useCallback, useMemo, useState } from 'react';
import { Form, Link, data, redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { commitSession } from '~/.server/session';
import { ErrorAlert } from '~/components/error-alert';
import config from '~/config';
import { slugify } from '~/utils/slugify';
import type { Route } from './+types/signup';

export function meta() {
  return [{ title: 'Tickflo Signup' }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name')?.toString();
  const workspaceName = formData.get('workspace-name')?.toString();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirm-password')?.toString();

  const context = await getContext(request);

  const {
    session,
    services: { AuthService },
  } = context;

  const returnUrl = session.get('returnUrl');

  const result = await AuthService.signup(
    {
      name,
      workspaceName,
      email,
      password,
      confirmPassword,
    },
    context,
  );

  if (result.isErr()) {
    return data({ message: result.error.message });
  }

  session.set('accessToken', result.value.token);
  session.set('userId', result.value.userId);

  const url = returnUrl || '/workspaces';
  return redirect(url, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const email = url.searchParams.get('email');
  const context = await getContext(request);
  const {
    session,
    services: { UserService },
  } = context;

  if (email) {
    const user = await UserService.getUserByEmail({ email }, context);
    if (user.isNone()) {
      session.flash('error', 'Unable to find user with that email');

      return redirect('.', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }

    return data({
      invited: true,
      email: user.value.email,
      name: user.value.name,
    });
  }
}

export default function Signup({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const errorMessage = useMemo(
    () => (actionData ? actionData.message : ''),
    [actionData],
  );

  const invited = loaderData?.invited || false;

  const [email, setEmail] = useState(loaderData?.email || '');
  const [name, setName] = useState(loaderData?.name || '');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');

  const onWorkspaceNameChange = useCallback((value: string) => {
    setWorkspaceName(value);
    setWorkspaceSlug(slugify(value, config.WORKSPACE.MAX_SLUG_LENGTH));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-base-200 pt-4">
      <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title"> Signup </h2>
          <Form method="post">
            <fieldset className="fieldset">
              <label htmlFor="name" className="fieldset-label">
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="Your name"
                maxLength={config.USER.MAX_NAME_LENGTH}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {!invited && (
                <>
                  <label htmlFor="workspace-name" className="fieldset-label">
                    Workspace name
                  </label>
                  {workspaceSlug.length >= 3 && (
                    <em title="Workspace URL Preview">
                      {window.location.protocol}
                      {'//'}
                      {window.location.host}
                      /workspaces/{workspaceSlug}
                    </em>
                  )}
                  <input
                    id="workspace-name"
                    name="workspace-name"
                    type="text"
                    className="input"
                    placeholder="Workspace name"
                    maxLength={config.WORKSPACE.MAX_NAME_LENGTH}
                    value={workspaceName}
                    onChange={(e) => onWorkspaceNameChange(e.target.value)}
                  />
                </>
              )}

              <label htmlFor="email" className="fieldset-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="password" className="fieldset-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                placeholder="Password"
              />
              <label htmlFor="confirm-password" className="fieldset-label">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                className="input"
                placeholder="Confirm Password"
              />
              {errorMessage && <ErrorAlert message={errorMessage} />}
              <button type="submit" className="btn btn-primary mt-4">
                Signup
              </button>
              <div className="text-center">
                Already have an account ?{' '}
                <Link to="/login" className="link link-hover text-xs">
                  Login
                </Link>
              </div>
            </fieldset>
          </Form>
        </div>
      </div>
    </div>
  );
}
