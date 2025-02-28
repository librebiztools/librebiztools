import { FaInfoCircle } from 'react-icons/fa';
import { Form } from 'react-router';

export function EmailConfirmationAlert() {
  return (
    <div role="alert" className="alert">
      <FaInfoCircle className="text-info" />
      <span>You have not yet confirmed your email address</span>
      <div>
        <Form
          method="post"
          action="/email-confirmation/dismiss"
          className="inline-block"
        >
          <button type="submit" className="btn btn-sm">
            Dismiss
          </button>
        </Form>{' '}
        <Form
          method="post"
          action="/email-confirmation/resend"
          className="inline-block"
        >
          <button type="submit" className="btn btn-sm btn-primary">
            Resend Email
          </button>
        </Form>
      </div>
    </div>
  );
}
