export function meta() {
  return [
    { title: 'libreBizTools Login' },
    { name: 'description', content: 'Login page for libreBizTools' },
  ];
}

export default function Login() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row">
        <div className="text-center lg:text-left">
          <h1 className="font-bold text-5xl">Login now!</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
        </div>
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
    </div>
  );
}
