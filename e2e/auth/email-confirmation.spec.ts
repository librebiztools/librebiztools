import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { getTestContext } from '~/.server/context';
import { confirmEmail, signup } from '~/.server/services/auth';
import { getUserById } from '~/.server/services/user';

const password = 'password';

test('Show email confirmation banner for new accounts', async ({ page }) => {
  const email = faker.internet.email();
  const context = await getTestContext();
  (
    await signup(
      {
        email,
        password,
        confirmPassword: password,
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
      },
      context,
    )
  ).unwrap();

  await page.goto('./login');
  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/workspaces/*');

  await expect(
    page.getByText('You have not yet confirmed your email address'),
  ).toBeVisible();
});

test('Not show after dismissing', async ({ page }) => {
  const email = faker.internet.email();
  const context = await getTestContext();
  (
    await signup(
      {
        email,
        password,
        confirmPassword: password,
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
      },
      context,
    )
  ).unwrap();

  await page.goto('./login');

  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/workspaces/*');

  await page
    .getByRole('button', {
      name: 'Dismiss',
    })
    .click();

  await expect(
    page.getByText('You have not yet confirmed your email address'),
  ).not.toBeVisible();

  await page.reload();

  await expect(
    page.getByText('You have not yet confirmed your email address'),
  ).not.toBeVisible();
});

test('Not show after resending', async ({ page }) => {
  const email = faker.internet.email();
  const context = await getTestContext();
  (
    await signup(
      {
        email,
        password,
        confirmPassword: password,
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
      },
      context,
    )
  ).unwrap();

  await page.goto('./login');

  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/workspaces/*');

  await page
    .getByRole('button', {
      name: 'Resend Email',
    })
    .click();

  await expect(
    page.getByText('You have not yet confirmed your email address'),
  ).not.toBeVisible();

  await page.reload();

  await expect(
    page.getByText('You have not yet confirmed your email address'),
  ).not.toBeVisible();
});

test('Not show after confirming', async ({ page }) => {
  const email = faker.internet.email();
  const context = await getTestContext();
  const { userId } = (
    await signup(
      {
        email,
        password,
        confirmPassword: password,
        name: faker.person.firstName(),
        workspaceName: faker.company.name(),
      },
      context,
    )
  ).unwrap();

  const user = (await getUserById({ id: userId }, context)).unwrap();

  await page.goto(
    `./email-confirmation/confirm?email=${encodeURIComponent(email)}&code=${encodeURIComponent(user.emailConfirmationCode ?? '')}`,
  );

  await page.waitForURL('./login');

  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/workspaces/*');

  await expect(
    page.getByText('You have not yet confirmed your email address'),
  ).not.toBeVisible();
});
