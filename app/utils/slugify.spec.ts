import { expect, test } from 'vitest';
import { slugify } from './slugify';

test('Replace spaces with hyphens', () => {
  expect(slugify('hello world')).toBe('hello-world');
});

test('Transform to lower case', () => {
  expect(slugify('HELLO WORLD')).toBe('hello-world');
});

test('Remove non-alphabet characters', () => {
  expect(slugify('hello! 1234 world !@#$')).toBe('hello-world');
});

test('Trim excess length', () => {
  expect(slugify('hello world', 5)).toBe('hello');
});

test('Trim trailing hyphens', () => {
  expect(slugify('hello world', 6)).toBe('hello');
});
