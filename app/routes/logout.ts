import { redirect } from 'react-router';

export function loader() {
  return redirect('/', {
    headers: {
      'Set-Cookie': 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
    },
  });
}
