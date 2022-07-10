import { CreatePaymentProfileController } from '@/presentation/controllers';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';
import { makeCreatePaymentProfileUseCaseStub } from '@tests/presentation/stubs/use-cases';

const paymentProfileMock = makePaymentProfileModelMock();

function makeSut() {
  const createPaymentProfileUseCase = makeCreatePaymentProfileUseCaseStub();
  const sut = new CreatePaymentProfileController(createPaymentProfileUseCase);

  return { createPaymentProfileUseCase, sut };
}

describe(CreatePaymentProfileController.name, () => {
  test('Should create paymentProfile and return correct values', async () => {
    const { createPaymentProfileUseCase, sut } = makeSut();

    createPaymentProfileUseCase.execute.mockReturnValueOnce(Promise.resolve(paymentProfileMock));

    const sutResult = await sut.handle(paymentProfileMock);

    expect(sutResult).toStrictEqual({ statusCode: 201, body: paymentProfileMock });
    expect(createPaymentProfileUseCase.execute).toBeCalledWith(paymentProfileMock);
  });
});
