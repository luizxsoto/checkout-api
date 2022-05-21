import { Decrypter } from '@/data/contracts/cryptography';
import { Roles } from '@/domain/models';
import { InvalidCredentials, InvalidPermissions } from '@/main/exceptions';
import { Middleware } from '@/presentation/contracts';

export type AuthMiddlewareRequest = {
  bearerToken?: string;
};

export class AuthMiddleware implements Middleware {
  constructor(private readonly decrypter: Decrypter, private readonly roles: Roles[]) {}

  async handle(request: AuthMiddlewareRequest): Promise<Record<string, unknown>> {
    if (!request.bearerToken) throw new InvalidCredentials();

    const user = {} as { id: string; roles: Roles[] };
    try {
      const decryptResult = await this.decrypter.decrypt<{ id: string; roles: Roles[] }>(
        request.bearerToken.replace('Bearer ', ''),
      );
      user.id = decryptResult.id;
      user.roles = decryptResult.roles;
    } catch {
      throw new InvalidCredentials();
    }

    if (this.roles.length && !this.roles.some((role) => user.roles.includes(role)))
      throw new InvalidPermissions();

    return { user };
  }
}
