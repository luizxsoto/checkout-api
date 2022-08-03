export type Role = 'admin' | 'moderator' | 'customer'

export type SessionModel = {
  userId: string
  role: Role
}
