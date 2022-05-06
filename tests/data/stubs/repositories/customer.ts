import { CreateCustomerRepository, FindByCustomerRepository } from '@/data/contracts/repositories';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';

export function makeCustomerRepositoryStub() {
  return {
    create: jest
      .fn()
      .mockImplementation(
        (
          requestModel: CreateCustomerRepository.RequestModel,
        ): CreateCustomerRepository.ResponseModel => makeCustomerModelMock(requestModel),
      ),
    findBy: jest
      .fn()
      .mockImplementation((): FindByCustomerRepository.ResponseModel => [makeCustomerModelMock()]),
  };
}
