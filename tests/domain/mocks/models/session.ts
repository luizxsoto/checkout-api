import { sign } from 'jsonwebtoken';

import { Roles, SessionModel } from '@/domain/models';
import { envConfig } from '@/main/config';

export function makeSessionModelMock(extraData?: Partial<SessionModel>) {
  return new SessionModel({
    userId: '00000000-0000-4000-8000-000000000001',
    roles: ['admin'],
    ...extraData,
  });
}

export async function makeBearerTokenMock(roles: Roles[] = ['admin']) {
  const bearerToken = sign({ ...makeSessionModelMock({ roles }) }, envConfig.jwtSecret);

  return bearerToken;
}
