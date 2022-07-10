import { RemoveOrderController } from '@/presentation/controllers';
import { makeOrderItemModelMock, makeOrderModelMock } from '@tests/domain/mocks/models';
import { makeRemoveOrderUseCaseStub } from '@tests/presentation/stubs/use-cases';

const orderMock = makeOrderModelMock();
const orderItemMock = makeOrderItemModelMock();

function makeSut() {
  const removeOrderUseCase = makeRemoveOrderUseCaseStub();
  const sut = new RemoveOrderController(removeOrderUseCase);

  return { removeOrderUseCase, sut };
}

describe(RemoveOrderController.name, () => {
  test('Should remove order and return correct values', async () => {
    const { removeOrderUseCase, sut } = makeSut();

    removeOrderUseCase.execute.mockReturnValueOnce(
      Promise.resolve({ ...orderMock, orderItems: [orderItemMock] }),
    );

    const sutResult = await sut.handle(orderMock);

    expect(sutResult).toStrictEqual({
      statusCode: 200,
      body: { ...orderMock, orderItems: [orderItemMock] },
    });
    expect(removeOrderUseCase.execute).toBeCalledWith(orderMock);
  });
});
