import { ListCustomerController } from '@/presentation/controllers';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeListCustomerUseCaseStub } from '@tests/presentation/stubs/use-cases';

const customerMock = makeCustomerModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: [customerMock] })),
}));

function makeSut() {
  const listCustomerUseCase = makeListCustomerUseCaseStub();
  const sut = new ListCustomerController(listCustomerUseCase);

  return { listCustomerUseCase, sut };
}

describe(ListCustomerController.name, () => {
  test('Should list customer and return correct values', async () => {
    const { listCustomerUseCase, sut } = makeSut();

    listCustomerUseCase.execute.mockReturnValueOnce(Promise.resolve([customerMock]));

    const sutResult = await sut.handle(customerMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: [customerMock] });
    expect(listCustomerUseCase.execute).toBeCalledWith(customerMock);
  });

  test('Should sanitize page and perPage', async () => {
    const { listCustomerUseCase, sut } = makeSut();

    listCustomerUseCase.execute.mockReturnValueOnce(Promise.resolve([customerMock]));

    const sutResult = await sut.handle({ ...customerMock, page: '1', perPage: '20' });

    expect(sutResult).toStrictEqual({ statusCode: 200, body: [customerMock] });
    expect(listCustomerUseCase.execute).toBeCalledWith({ ...customerMock, page: 1, perPage: 20 });
  });
});
