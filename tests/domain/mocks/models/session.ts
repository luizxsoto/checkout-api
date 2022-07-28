import { sign } from 'jsonwebtoken';

import { Roles, SessionModel } from '@/domain/models';
import { envConfig } from '@/main/config';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

export function makeSessionModelMock(extraData?: Partial<SessionModel>) {
  return {
    userId: validUuidV4,
    roles: ['admin'] as Roles[],
    ...extraData,
  };
}

export async function makeBearerTokenMock(extraData?: Partial<SessionModel>) {
  const bearerToken = sign({ ...makeSessionModelMock(extraData) }, envConfig.jwtSecret);

  return bearerToken;
}
