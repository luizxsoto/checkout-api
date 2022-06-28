import { ShowPaymentProfileController } from '@/presentation/controllers';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';
import { makeShowPaymentProfileUseCaseStub } from '@tests/presentation/stubs/use-cases';

const paymentProfileMock = makePaymentProfileModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: paymentProfileMock })),
}));

function makeSut() {
  const showPaymentProfileUseCase = makeShowPaymentProfileUseCaseStub();
  const sut = new ShowPaymentProfileController(showPaymentProfileUseCase);

  return { showPaymentProfileUseCase, sut };
}

describe(ShowPaymentProfileController.name, () => {
  test('Should show paymentProfile and return correct values', async () => {
    const { showPaymentProfileUseCase, sut } = makeSut();

    showPaymentProfileUseCase.execute.mockReturnValueOnce(Promise.resolve(paymentProfileMock));

    const sutResult = await sut.handle(paymentProfileMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: paymentProfileMock });
    expect(showPaymentProfileUseCase.execute).toBeCalledWith(paymentProfileMock);
  });
});
