import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('signup', 'routes/signup.tsx'),
  route('logout', 'routes/logout.ts'),
  route('/api/reset-db', 'routes/api/reset-db.ts'),
] satisfies RouteConfig;
