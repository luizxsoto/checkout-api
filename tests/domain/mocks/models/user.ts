import { UserModel } from '@/domain/models';

export function makeUserModelMock(extraData?: Partial<UserModel>) {
  return new UserModel({
    id: 'any_id',
    createdAt: new Date(),
    name: 'Any Name',
    email: 'valid@email.com',
    password: 'Password@123',
    ...extraData,
  });
}
