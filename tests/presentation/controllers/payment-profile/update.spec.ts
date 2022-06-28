import { UpdatePaymentProfileController } from '@/presentation/controllers';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';
import { makeUpdatePaymentProfileUseCaseStub } from '@tests/presentation/stubs/use-cases';

const paymentProfileMock = makePaymentProfileModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: paymentProfileMock })),
}));

function makeSut() {
  const updatePaymentProfileUseCase = makeUpdatePaymentProfileUseCaseStub();
  const sut = new UpdatePaymentProfileController(updatePaymentProfileUseCase);

  return { updatePaymentProfileUseCase, sut };
}

describe(UpdatePaymentProfileController.name, () => {
  test('Should update paymentProfile and return correct values', async () => {
    const { updatePaymentProfileUseCase, sut } = makeSut();

    updatePaymentProfileUseCase.execute.mockReturnValueOnce(Promise.resolve(paymentProfileMock));

    const sutResult = await sut.handle(paymentProfileMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: paymentProfileMock });
    expect(updatePaymentProfileUseCase.execute).toBeCalledWith(paymentProfileMock);
  });
});
