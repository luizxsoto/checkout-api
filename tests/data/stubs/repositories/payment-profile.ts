import {
  CreatePaymentProfileRepository,
  FindByPaymentProfileRepository,
  ListPaymentProfileRepository,
  RemovePaymentProfileRepository,
  UpdatePaymentProfileRepository,
} from '@/data/contracts/repositories';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';

export function makePaymentProfileRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation(
        (): FindByPaymentProfileRepository.ResponseModel => [makePaymentProfileModelMock()],
      ),
    list: jest
      .fn()
      .mockImplementation(
        (): ListPaymentProfileRepository.ResponseModel => [makePaymentProfileModelMock()],
      ),
    create: jest
      .fn()
      .mockImplementation(
        (
          requestModel: CreatePaymentProfileRepository.RequestModel,
        ): CreatePaymentProfileRepository.ResponseModel =>
          makePaymentProfileModelMock(requestModel),
      ),
    update: jest
      .fn()
      .mockImplementation(
        (
          requestModel: UpdatePaymentProfileRepository.RequestModel,
        ): UpdatePaymentProfileRepository.ResponseModel => [
          makePaymentProfileModelMock(requestModel[1]),
        ],
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (
          requestModel: RemovePaymentProfileRepository.RequestModel,
        ): RemovePaymentProfileRepository.ResponseModel => [
          makePaymentProfileModelMock(requestModel[0]),
        ],
      ),
  };
}
