import { RemovePaymentProfileController } from '@/presentation/controllers';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';
import { makeRemovePaymentProfileUseCaseStub } from '@tests/presentation/stubs/use-cases';

const customerMock = makePaymentProfileModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: customerMock })),
}));

function makeSut() {
  const removePaymentProfileUseCase = makeRemovePaymentProfileUseCaseStub();
  const sut = new RemovePaymentProfileController(removePaymentProfileUseCase);

  return { removePaymentProfileUseCase, sut };
}

describe(RemovePaymentProfileController.name, () => {
  test('Should remove customer and return correct values', async () => {
    const { removePaymentProfileUseCase, sut } = makeSut();

    removePaymentProfileUseCase.execute.mockReturnValueOnce(Promise.resolve(customerMock));

    const sutResult = await sut.handle(customerMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: customerMock });
    expect(removePaymentProfileUseCase.execute).toBeCalledWith(customerMock);
  });
});
