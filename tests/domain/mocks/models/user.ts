import { makeBaseModelMock } from './base';

import { UserModel } from '@/domain/models';

export function makeUserModelMock(extraData?: Partial<UserModel>) {
  return new UserModel({
    ...makeBaseModelMock(extraData),
    name: 'Any Name',
    email: 'valid@email.com',
    password: 'Password@123',
    roles: [],
    ...extraData,
  });
}
