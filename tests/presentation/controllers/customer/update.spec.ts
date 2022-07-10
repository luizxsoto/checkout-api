import { UpdateCustomerController } from '@/presentation/controllers';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeUpdateCustomerUseCaseStub } from '@tests/presentation/stubs/use-cases';

const customerMock = makeCustomerModelMock();

function makeSut() {
  const updateCustomerUseCase = makeUpdateCustomerUseCaseStub();
  const sut = new UpdateCustomerController(updateCustomerUseCase);

  return { updateCustomerUseCase, sut };
}

describe(UpdateCustomerController.name, () => {
  test('Should update customer and return correct values', async () => {
    const { updateCustomerUseCase, sut } = makeSut();

    updateCustomerUseCase.execute.mockReturnValueOnce(Promise.resolve(customerMock));

    const sutResult = await sut.handle(customerMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: customerMock });
    expect(updateCustomerUseCase.execute).toBeCalledWith(customerMock);
  });
});
