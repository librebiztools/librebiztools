import { hash, verify } from '@node-rs/argon2';

const CONFIG = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export async function createHash(input: string): Promise<string> {
  return hash(input, CONFIG);
}

export async function validateHash(
  input: string,
  hash: string,
): Promise<boolean> {
  return verify(hash, input, CONFIG);
}
