import { Decrypter } from '@/data/contracts/cryptography'
import { Role, SessionModel } from '@/domain/models'
import { InvalidCredentials, InvalidPermissions } from '@/main/exceptions'
import { Middleware } from '@/presentation/contracts'

export type AuthMiddlewareRequest = {
  bearerToken?: string
}

export class AuthMiddleware implements Middleware {
  constructor(
    private readonly decrypter: Decrypter,
    private readonly roles: Role[],
    private readonly isOptional?: boolean
  ) {}

  async handle(request: AuthMiddlewareRequest): Promise<{ session: SessionModel }> {
    const session = {} as SessionModel

    if (!request.bearerToken) {
      if (this.isOptional) return { session }
      throw new InvalidCredentials()
    }

    try {
      const decryptResult = await this.decrypter.decrypt<{ userId: string; role: Role }>(
        request.bearerToken.replace(/^bearer\s?/i, '')
      )
      session.userId = decryptResult.userId
      session.role = decryptResult.role
    } catch {
      throw new InvalidCredentials()
    }

    const propsToValidateSession = ['userId', 'role']
    if (!propsToValidateSession.every((prop) => Boolean(session[prop as keyof SessionModel])))
      throw new InvalidCredentials()

    const hasPermission = !this.roles.length || this.roles.includes(session.role)
    if (!hasPermission) throw new InvalidPermissions()

    return { session }
  }
}
