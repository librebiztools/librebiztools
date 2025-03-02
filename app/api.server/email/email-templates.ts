export type EmailTemplate = {
  typeId: number;
  subject: string;
  body: string;
};

export const SYSTEM_TEMPLATE_IDS = [1, 2];

const signup = {
  typeId: 1,
  subject: 'Welcome to Tickflo! Confirm Your Email',
  body: `Hello,

Thank you for signing up! Please confirm your email address by clicking the link below:

{{confirmation_link}}

If you did not sign up, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

const forgotPassword = {
  typeId: 2,
  subject: 'Reset Your Password',
  body: `Hello,

We received a request to reset your password. Click the link below to set a new password:

{{reset_link}}

If you did not request this, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

const existingWorkspaceMemberInvitation = {
  typeId: 3,
  subject: 'You’re Invited! Join Our Workspace',
  body: `Hello {{name}},

You’ve been invited to join {{workspace_name}}. Simply login and click accept to join {{workspace_name}}:

{{login_link}}

If you weren’t expecting this invitation, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

const newWorkspaceMemberInvitation = {
  typeId: 4,
  subject: 'You’re Invited! Join Our Workspace',
  body: `Hello {{name}},

You’ve been invited to join {{workspace_name}}. Click the link below to create your account and get started:

{{signup_link}}

If you weren’t expecting this invitation, you can ignore this email.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

const workspaceMemberRemoval = {
  typeId: 5,
  subject: 'Your access to {{workspace_name}} has been removed',
  body: `Hello {{name}},

You’ve been removed from {{workspace_name}}. 

Contact your administrator if you belive this is a mistake.

Best regards,  
Tickflo Team`,
} satisfies EmailTemplate;

export const templates = {
  signup,
  forgotPassword,
  newWorkspaceMemberInvitation,
  existingWorkspaceMemberInvitation,
  workspaceMemberRemoval,
};

export const workspaceTemplates = [
  newWorkspaceMemberInvitation,
  existingWorkspaceMemberInvitation,
  workspaceMemberRemoval,
];
