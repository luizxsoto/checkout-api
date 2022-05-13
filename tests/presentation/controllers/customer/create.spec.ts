import { CreateCustomerController } from '@/presentation/controllers';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeCreateCustomerUseCaseStub } from '@tests/presentation/stubs/use-cases';

const customerMock = makeCustomerModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  created: jest.fn(() => ({ statusCode: 201, body: customerMock })),
}));

function makeSut() {
  const createCustomerUseCase = makeCreateCustomerUseCaseStub();
  const sut = new CreateCustomerController(createCustomerUseCase);

  return { createCustomerUseCase, sut };
}

describe(CreateCustomerController.name, () => {
  test('Should create customer and return correct values', async () => {
    const { createCustomerUseCase, sut } = makeSut();

    createCustomerUseCase.execute.mockReturnValueOnce(Promise.resolve(customerMock));

    const sutResult = await sut.handle(customerMock);

    expect(sutResult).toStrictEqual({ statusCode: 201, body: customerMock });
    expect(createCustomerUseCase.execute).toBeCalledWith(customerMock);
  });
});
