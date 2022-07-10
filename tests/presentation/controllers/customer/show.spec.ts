import { ShowCustomerController } from '@/presentation/controllers';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeShowCustomerUseCaseStub } from '@tests/presentation/stubs/use-cases';

const customerMock = makeCustomerModelMock();

function makeSut() {
  const showCustomerUseCase = makeShowCustomerUseCaseStub();
  const sut = new ShowCustomerController(showCustomerUseCase);

  return { showCustomerUseCase, sut };
}

describe(ShowCustomerController.name, () => {
  test('Should show customer and return correct values', async () => {
    const { showCustomerUseCase, sut } = makeSut();

    showCustomerUseCase.execute.mockReturnValueOnce(Promise.resolve(customerMock));

    const sutResult = await sut.handle(customerMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: customerMock });
    expect(showCustomerUseCase.execute).toBeCalledWith(customerMock);
  });
});
