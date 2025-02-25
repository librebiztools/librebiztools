import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

export function EmailConfirmationAlert() {
  const fetcher = useFetcher();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (fetcher.data) {
      setVisible(false);
    }
  }, [fetcher.data]);

  return (
    <>
      {visible && (
        <fetcher.Form method="get" action="/resend-confirmation">
          <div role="alert" className="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-info"
            >
              <title>Info icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>You have not yet confirmed your email address</span>
            <div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setVisible(false)}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={(e) => fetcher.submit(e.currentTarget.form)}
              >
                Resend Email
                {fetcher.state !== 'idle' && (
                  <span className="loading loading-spinner loading-xs" />
                )}
              </button>
            </div>
          </div>
        </fetcher.Form>
      )}
    </>
  );
}
