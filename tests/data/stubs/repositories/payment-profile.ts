import {
  CreatePaymentProfileRepository,
  FindByPaymentProfileRepository,
  ListPaymentProfileRepository,
  RemovePaymentProfileRepository,
  UpdatePaymentProfileRepository,
} from '@/data/contracts/repositories';
import { PaymentProfileModel } from '@/domain/models';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';

const makePaymentProfiles: () => PaymentProfileModel[] = () => [
  makePaymentProfileModelMock(),
  {
    ...makePaymentProfileModelMock(),
    paymentMethod: 'PHONE_PAYMENT',
    data: { ...makePaymentProfileModelMock().data, number: '1234567890' },
  },
];

export function makePaymentProfileRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation(
        (): FindByPaymentProfileRepository.ResponseModel => makePaymentProfiles(),
      ),
    list: jest
      .fn()
      .mockImplementation((): ListPaymentProfileRepository.ResponseModel => makePaymentProfiles()),
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
