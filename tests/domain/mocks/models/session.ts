import { sign } from 'jsonwebtoken';

import { SessionModel } from '@/domain/models';
import { envConfig } from '@/main/config';

export function makeSessionModelMock(extraData?: Partial<SessionModel>) {
  return new SessionModel({
    userId: '00000000-0000-4000-8000-000000000001',
    roles: ['admin'],
    ...extraData,
  });
}

export async function makeBearerTokenMock(extraData?: Partial<SessionModel>) {
  const bearerToken = sign({ ...makeSessionModelMock(extraData) }, envConfig.jwtSecret);

  return bearerToken;
}
