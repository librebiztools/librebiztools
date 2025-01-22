export function meta() {
  return [
    { title: 'libreBizTools Login' },
    { name: 'description', content: 'Login page for libreBizTools' },
  ];
}

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-base-200 pt-4">
      <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title">Login</h2>
          <fieldset className="fieldset">
            <label className="fieldset-label">Email</label>
            <input type="email" className="input" placeholder="Email" />
            <label className="fieldset-label">Password</label>
            <input type="password" className="input" placeholder="Password" />
            <div>
              <a className="link link-hover">Forgot password?</a>
            </div>
            <button type="button" className="btn btn-primary mt-4">
              Login
            </button>
            <div className="text-center">
              <a className="link link-hover text-xs">Signup</a>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
