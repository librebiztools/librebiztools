import { expect, test } from 'vitest';
import { createHash, validateHash } from './hash';

test('Hashing works as expected', async () => {
  const hash = await createHash('test');
  expect(await validateHash('test', hash)).toBe(true);
});
