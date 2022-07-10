import { RemoveCustomerController } from '@/presentation/controllers';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeRemoveCustomerUseCaseStub } from '@tests/presentation/stubs/use-cases';

const customerMock = makeCustomerModelMock();

function makeSut() {
  const removeCustomerUseCase = makeRemoveCustomerUseCaseStub();
  const sut = new RemoveCustomerController(removeCustomerUseCase);

  return { removeCustomerUseCase, sut };
}

describe(RemoveCustomerController.name, () => {
  test('Should remove customer and return correct values', async () => {
    const { removeCustomerUseCase, sut } = makeSut();

    removeCustomerUseCase.execute.mockReturnValueOnce(Promise.resolve(customerMock));

    const sutResult = await sut.handle(customerMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: customerMock });
    expect(removeCustomerUseCase.execute).toBeCalledWith(customerMock);
  });
});
