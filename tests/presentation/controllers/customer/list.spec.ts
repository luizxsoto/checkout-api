import { ListCustomerController } from '@/presentation/controllers';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';
import { makeListCustomerUseCaseStub } from '@tests/presentation/stubs/use-cases';

const customerMock = makeCustomerModelMock();

function makeSut() {
  const listCustomerUseCase = makeListCustomerUseCaseStub();
  const sut = new ListCustomerController(listCustomerUseCase);

  return { listCustomerUseCase, sut };
}

describe(ListCustomerController.name, () => {
  test('Should list customer and return correct values', async () => {
    const { listCustomerUseCase, sut } = makeSut();

    listCustomerUseCase.execute.mockReturnValueOnce(Promise.resolve([customerMock]));

    const sutResult = await sut.handle({});

    expect(sutResult).toStrictEqual({ statusCode: 200, body: [customerMock] });
    expect(listCustomerUseCase.execute).toBeCalledWith({});
  });
});
