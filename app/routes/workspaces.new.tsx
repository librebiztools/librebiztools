import { useCallback, useMemo, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { Form, data, href, redirect } from 'react-router';
import { AuthError } from '~/.server/errors';
import { createWorkspace } from '~/.server/services/workspace';
import { appContext } from '~/app-context';
import { ErrorAlert } from '~/components/error-alert';
import config from '~/config';
import { slugify } from '~/utils/slugify';
import type { Route } from './+types/workspaces.new';

export async function action({ context, request }: Route.ActionArgs) {
  const ctx = context.get(appContext);
  const { user } = ctx;

  if (user.isNone()) {
    throw new AuthError('User not found');
  }

  const formData = await request.formData();
  const workspaceName = formData.get('workspace-name')?.toString();

  const result = await createWorkspace(
    {
      userId: user.value.id,
      name: workspaceName,
    },
    ctx,
  );

  if (result.isErr()) {
    return data(result.error);
  }

  return redirect(href('/workspaces/:slug', result.value));
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
