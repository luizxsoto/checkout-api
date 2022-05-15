import {
  CreateCustomerRepository,
  FindByCustomerRepository,
  RemoveCustomerRepository,
  UpdateCustomerRepository,
} from '@/data/contracts/repositories';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';

export function makeCustomerRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation((): FindByCustomerRepository.ResponseModel => [makeCustomerModelMock()]),
    create: jest
      .fn()
      .mockImplementation(
        (
          requestModel: CreateCustomerRepository.RequestModel,
        ): CreateCustomerRepository.ResponseModel => makeCustomerModelMock(requestModel),
      ),
    update: jest
      .fn()
      .mockImplementation(
        (
          requestModel: UpdateCustomerRepository.RequestModel,
        ): UpdateCustomerRepository.ResponseModel => makeCustomerModelMock(requestModel[1]),
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (
          requestModel: RemoveCustomerRepository.RequestModel,
        ): RemoveCustomerRepository.ResponseModel => makeCustomerModelMock(requestModel[0]),
      ),
  };
}
