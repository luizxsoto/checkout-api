import { ListOrderController } from '@/presentation/controllers';
import { makeOrderModelMock } from '@tests/domain/mocks/models';
import { makeListOrderUseCaseStub } from '@tests/presentation/stubs/use-cases';

const orderMock = makeOrderModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: [orderMock] })),
}));

function makeSut() {
  const listOrderUseCase = makeListOrderUseCaseStub();
  const sut = new ListOrderController(listOrderUseCase);

  return { listOrderUseCase, sut };
}

describe(ListOrderController.name, () => {
  test('Should list order and return correct values', async () => {
    const { listOrderUseCase, sut } = makeSut();

    listOrderUseCase.execute.mockReturnValueOnce(Promise.resolve([orderMock]));

    const sutResult = await sut.handle({});

    expect(sutResult).toStrictEqual({ statusCode: 200, body: [orderMock] });
    expect(listOrderUseCase.execute).toBeCalledWith({});
  });
});
