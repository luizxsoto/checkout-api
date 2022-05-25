import { sign } from 'jsonwebtoken';

import { Roles } from '@/domain/models';
import { envConfig } from '@/main/config';

export async function makeBearerTokenMock(roles: Roles[] = ['admin']) {
  const bearerToken = sign(
    { id: '00000000-0000-4000-8000-000000000001', roles },
    envConfig.jwtSecret,
  );

  return bearerToken;
}
