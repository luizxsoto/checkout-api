import { RemovePaymentProfileController } from '@/presentation/controllers';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';
import { makeRemovePaymentProfileUseCaseStub } from '@tests/presentation/stubs/use-cases';

const userMock = makePaymentProfileModelMock();

function makeSut() {
  const removePaymentProfileUseCase = makeRemovePaymentProfileUseCaseStub();
  const sut = new RemovePaymentProfileController(removePaymentProfileUseCase);

  return { removePaymentProfileUseCase, sut };
}

describe(RemovePaymentProfileController.name, () => {
  test('Should remove user and return correct values', async () => {
    const { removePaymentProfileUseCase, sut } = makeSut();

    removePaymentProfileUseCase.execute.mockReturnValueOnce(Promise.resolve(userMock));

    const sutResult = await sut.handle(userMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: userMock });
    expect(removePaymentProfileUseCase.execute).toBeCalledWith(userMock);
  });
});
