export type Roles = 'admin' | 'moderator';

export type SessionModel = {
  userId: string;
  roles: Roles[];
};
