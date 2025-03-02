import { useMemo } from 'react';
import { Form, Link, data, redirect } from 'react-router';
import { getContext } from '~/.server/context';
import { commitSession } from '~/.server/session';
import { ErrorAlert } from '~/components/error-alert';
import type { Route } from './+types/login';

export function meta() {
  return [{ title: 'Tickflo Login' }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const context = await getContext(request);
  const {
    session,
    services: { AuthService },
  } = context;
  const returnUrl = session.get('returnUrl');

  const result = await AuthService.login({ email, password }, context);

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

export default function Login({ actionData }: Route.ComponentProps) {
  const errorMessage = useMemo(
    () => (actionData ? actionData.message : ''),
    [actionData],
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-base-200 pt-4">
      <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title">Login</h2>
          <Form method="post">
            <fieldset className="fieldset">
              <label htmlFor="email" className="fieldset-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="Email"
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
              <div>
                <a className="link link-hover" href="#forgot-password">
                  Forgot password?
                </a>
              </div>
              {errorMessage && <ErrorAlert message={errorMessage} />}
              <button type="submit" className="btn btn-primary mt-4">
                Login
              </button>
              <div className="text-center">
                Need an account?{' '}
                <Link to="/signup" className="link link-hover text-xs">
                  Signup
                </Link>
              </div>
            </fieldset>
          </Form>
        </div>
      </div>
    </div>
  );
}
