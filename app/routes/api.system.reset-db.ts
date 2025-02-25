import { data } from 'react-router';
import { reset } from '~/api.server/db/reset';

export async function loader() {
  if (process.env.NODE_ENV !== 'development') {
    return data('Database reset not allowed', {
      status: 405,
    });
  }

  await reset();

  return 'Database reset';
}
