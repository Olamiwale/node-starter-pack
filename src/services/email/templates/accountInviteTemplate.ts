export const accountInviteTemplate = (
  inviteUrl: string
) => `
  <p>You have been invited to join an account.</p>
  <p>Click the link below to accept the invite:</p>
  <a href="${inviteUrl}">${inviteUrl}</a>
`;
