export type EmailTemplate = {
  subject: string;
  body: string;
};

export const SIGNUP_TEMPLATE_ID = 1;
export const FORGOT_PASSWORD_TEMPLATE_ID = 2;

const signup = {
  subject: 'Welcome to Tickflo! Confirm Your Email',
  body: `Hello,

Thank you for signing up! Please confirm your email address by clicking the link below:

{{confirmation_link}}

If you did not sign up, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

const forgotPassword = {
  subject: 'Reset Your Password',
  body: `Hello,

We received a request to reset your password. Click the link below to set a new password:

{{reset_link}}

If you did not request this, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

const existingWorkspaceMemberInvitation = {
  subject: 'You’re Invited! Join Our Workspace',
  body: `Hello {{name}},

You’ve been invited to join {{workspace_name}}. Click the link below to accept this invitation:

{{accept_link}}

If you weren’t expecting this invitation, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

const newWorkspaceMemberInvitation = {
  subject: 'You’re Invited! Join Our Workspace',
  body: `Hello,

You’ve been invited to join {{workspace_name}}. Click the link below to create your account and get started:

{{signup_link}}

If you weren’t expecting this invitation, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

export const templates = {
  signup,
  forgotPassword,
  newWorkspaceMemberInvitation,
  existingWorkspaceMemberInvitation,
};
