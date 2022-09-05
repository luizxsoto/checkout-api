import { BaseModel } from './base'
import { Role } from './session'

export type UserModel = BaseModel & {
  name: string
  email: string
  password: string
  role: Role
  image?: string
}
