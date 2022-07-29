import { Decrypter } from '@/data/contracts/cryptography'
import { Roles, SessionModel } from '@/domain/models'
import { InvalidCredentials, InvalidPermissions } from '@/main/exceptions'
import { Middleware } from '@/presentation/contracts'

export type AuthMiddlewareRequest = {
  bearerToken?: string
}

export class AuthMiddleware implements Middleware {
  constructor(private readonly decrypter: Decrypter, private readonly roles: Roles[]) {}

  async handle(request: AuthMiddlewareRequest): Promise<Record<string, unknown>> {
    if (!request.bearerToken) throw new InvalidCredentials()

    const session = {} as SessionModel
    try {
      const decryptResult = await this.decrypter.decrypt<{ userId: string; roles: Roles[] }>(
        request.bearerToken.replace(/^bearer\s?/i, '')
      )
      session.userId = decryptResult.userId
      session.roles = decryptResult.roles
    } catch {
      throw new InvalidCredentials()
    }

    const propsToValidateSession = ['userId', 'roles']
    if (!propsToValidateSession.every((prop) => Boolean(session[prop as keyof SessionModel])))
      throw new InvalidCredentials()

    if (this.roles.length && !this.roles.some((role) => session.roles.includes(role)))
      throw new InvalidPermissions()

    return { session }
  }
}
