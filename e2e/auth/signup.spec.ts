import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { slugify } from '~/utils/slugify';

test.beforeEach(async ({ page }) => {
  await page.goto('./signup');
});

test('Redirects to workspace page after successful signup', async ({
  page,
}) => {
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  await page.getByLabel('Your name').fill(faker.person.firstName());
  await page.getByLabel('Workspace name').fill(workspaceName);
  await page.getByLabel('Email').fill(faker.internet.email());
  await page.locator('input[name="password"]').fill('password');
  await page.locator('input[name="confirm-password"]').fill('password');
  await page.getByRole('button', { name: 'Signup' }).click();

  await page.waitForURL(`**/workspaces/${slug}`);

  expect(
    await page.getByRole('link', { name: workspaceName }).textContent(),
  ).toBe(workspaceName);
});

test('Slugifies workspace name', async ({ page }) => {
  const workspaceName = faker.company.name();
  const slug = slugify(workspaceName);

  await page.getByLabel('Workspace name').fill(workspaceName);
  await expect(page.getByText(slug)).toBeVisible();
});

test('Errors on mismatched passwords', async ({ page }) => {
  await page.getByLabel('Your name').fill(faker.person.firstName());
  await page.getByLabel('Workspace name').fill(faker.company.name());
  await page.getByLabel('Email').fill(faker.internet.email());
  await page.locator('input[name="password"]').fill('password');
  await page.locator('input[name="confirm-password"]').fill('different');
  await page.getByRole('button', { name: 'Signup' }).click();

  await expect(page.getByText('Passwords do not match')).toBeVisible();
});

test('Errors on missing name', async ({ page }) => {
  await page.getByLabel('Workspace name').fill(faker.company.name());
  await page.getByLabel('Email').fill(faker.internet.email());
  await page.locator('input[name="password"]').fill('password');
  await page.locator('input[name="confirm-password"]').fill('password');
  await page.getByRole('button', { name: 'Signup' }).click();

  await expect(page.getByText('Name must be between')).toBeVisible();
});

test('Errors on missing email', async ({ page }) => {
  await page.getByLabel('Your name').fill(faker.person.firstName());
  await page.getByLabel('Workspace name').fill(faker.company.name());
  await page.locator('input[name="password"]').fill('password');
  await page.locator('input[name="confirm-password"]').fill('password');
  await page.getByRole('button', { name: 'Signup' }).click();

  await expect(page.getByText('Email is required')).toBeVisible();
});

test('Errors on missing password', async ({ page }) => {
  await page.getByLabel('Your name').fill(faker.person.firstName());
  await page.getByLabel('Email').fill(faker.internet.email());
  await page.getByLabel('Workspace name').fill(faker.company.name());
  await page.locator('input[name="confirm-password"]').fill('password');
  await page.getByRole('button', { name: 'Signup' }).click();

  await expect(page.getByText('Password is required')).toBeVisible();
});

test('Errors on missing confirm password', async ({ page }) => {
  await page.getByLabel('Your name').fill(faker.person.firstName());
  await page.getByLabel('Email').fill(faker.internet.email());
  await page.getByLabel('Workspace name').fill(faker.company.name());
  await page.locator('input[name="password"]').fill('password');
  await page.getByRole('button', { name: 'Signup' }).click();

  await expect(page.getByText('Confirm password is required')).toBeVisible();
});
