import { useMemo } from 'react';
import { Form, Link, data, redirect } from 'react-router';
import { createCookie, signup } from '~/api.server/auth';
import { ApiError } from '~/api.server/errors';
import type { Route } from './+types/signup';

export function meta() {
  return [{ title: 'libreBizTools Signup' }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirm-password')?.toString();

  try {
    const result = await signup({ email, password, confirmPassword });
    return redirect('/', {
      headers: {
        'Set-Cookie': createCookie(result.token),
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return data({ message: err.message }, { status: err.code });
    }

    throw err;
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const errorMessage = useMemo(
    () => (actionData ? actionData.message : ''),
    [actionData],
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-base-200 pt-4">
      <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title">Signup</h2>
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
              <button type="submit" className="btn btn-primary mt-4">
                Signup
              </button>
              <div className="text-center">
                Already have an account?{' '}
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
