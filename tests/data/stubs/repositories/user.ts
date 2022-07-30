import { makeUserModelMock } from '@tests/domain/mocks/models'

import {
  CreateUserRepository,
  FindByUserRepository,
  ListUserRepository,
  RemoveUserRepository,
  UpdateUserRepository
} from '@/data/contracts/repositories'

export function makeUserRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation((): FindByUserRepository.ResponseModel => [makeUserModelMock()]),
    list: jest
      .fn()
      .mockImplementation((): ListUserRepository.ResponseModel => [makeUserModelMock()]),
    create: jest
      .fn()
      .mockImplementation(
        (requestModel: CreateUserRepository.RequestModel): CreateUserRepository.ResponseModel =>
          requestModel.map((itemModel) => makeUserModelMock(itemModel))
      ),
    update: jest
      .fn()
      .mockImplementation(
        (requestModel: UpdateUserRepository.RequestModel): UpdateUserRepository.ResponseModel => [
          makeUserModelMock(requestModel[1])
        ]
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (requestModel: RemoveUserRepository.RequestModel): RemoveUserRepository.ResponseModel => [
          makeUserModelMock(requestModel[0])
        ]
      )
  }
}
