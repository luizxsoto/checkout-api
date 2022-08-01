import { Roles } from '@/domain/models'
import { adaptMiddleware } from '@/main/adapters'
import { makeAuthMiddleware } from '@/main/factories/middlewares'

export function auth(roles: Roles[], isOptional?: boolean) {
  return adaptMiddleware(makeAuthMiddleware(roles, isOptional))
}
