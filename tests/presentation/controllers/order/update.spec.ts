import { UpdateOrderController } from '@/presentation/controllers';
import { makeOrderModelMock } from '@tests/domain/mocks/models';
import { makeUpdateOrderUseCaseStub } from '@tests/presentation/stubs/use-cases';

const orderMock = makeOrderModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: orderMock })),
}));

function makeSut() {
  const updateOrderUseCase = makeUpdateOrderUseCaseStub();
  const sut = new UpdateOrderController(updateOrderUseCase);

  return { updateOrderUseCase, sut };
}

describe(UpdateOrderController.name, () => {
  test('Should update order and return correct values', async () => {
    const { updateOrderUseCase, sut } = makeSut();

    updateOrderUseCase.execute.mockReturnValueOnce(Promise.resolve(orderMock));

    const sutResult = await sut.handle(orderMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: orderMock });
    expect(updateOrderUseCase.execute).toBeCalledWith(orderMock);
  });
});
