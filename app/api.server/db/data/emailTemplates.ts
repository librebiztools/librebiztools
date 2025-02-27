export type EmailTemplate = {
  subject: string;
  body: string;
};

export const signup = {
  subject: 'Welcome to Tickflo! Confirm Your Email',
  body: `Hello,

Thank you for signing up! Please confirm your email address by clicking the link below:

{{confirmation_link}}

If you did not sign up, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

export const forgotPassword = {
  subject: 'Reset Your Password',
  body: `Hello,

We received a request to reset your password. Click the link below to set a new password:

{{reset_link}}

If you did not request this, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

export const teamMemberInvitation = {
  subject: 'You’re Invited! Join Our Team',
  body: `Hello,

You’ve been invited to join {{team_name}}. Click the link below to create your account and get started:

{{signup_link}}

If you weren’t expecting this invitation, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

export const addedToWorkspace = {
  subject: 'You’ve Been Added to {{workspace_name}}!',
  body: `Hello,

You’ve been added to the {{workspace_name}} workspace. Click the link below to access it:

{{workspace_link}}

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;
