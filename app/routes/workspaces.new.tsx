import { useCallback, useMemo, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { Form, data, href, redirect } from 'react-router';
import { db } from '~/api.server/db';
import { ApiError } from '~/api.server/errors';
import { loginRedirect } from '~/api.server/helpers';
import { getSession } from '~/api.server/session';
import { createWorkspace } from '~/api.server/workspaces';
import { ErrorAlert } from '~/components/error-alert';
import config from '~/config';
import { slugify } from '~/utils/slugify';
import type { Route } from './+types/workspaces.new';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session);
  }
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return loginRedirect(session, request.url);
  }

  const formData = await request.formData();
  const workspaceName = formData.get('workspace-name')?.toString();

  try {
    return db.transaction(async (tx) => {
      const { slug } = await createWorkspace({
        userId,
        name: workspaceName,
        tx,
      });

      return redirect(href('/workspaces/:slug', { slug }));
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return data({ message: err.message }, { status: err.code });
    }

    throw err;
  }
}

export default function workspacesNew({ actionData }: Route.ComponentProps) {
  const errorMessage = useMemo(
    () => (actionData ? actionData.message : ''),
    [actionData],
  );
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
          <h2 className="card-title">New Workspace</h2>
          <Form method="post">
            <fieldset className="fieldset">
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
              {errorMessage && <ErrorAlert message={errorMessage} />}
              <button type="submit" className="btn btn-primary mt-4">
                <FaCheck /> Create Workspace
              </button>
            </fieldset>
          </Form>
        </div>
      </div>
    </div>
  );
}
