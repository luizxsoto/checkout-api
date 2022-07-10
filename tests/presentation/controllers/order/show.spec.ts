import { ShowOrderController } from '@/presentation/controllers';
import { makeOrderItemModelMock, makeOrderModelMock } from '@tests/domain/mocks/models';
import { makeShowOrderUseCaseStub } from '@tests/presentation/stubs/use-cases';

const orderMock = makeOrderModelMock();
const orderItemMock = makeOrderItemModelMock();

function makeSut() {
  const showOrderUseCase = makeShowOrderUseCaseStub();
  const sut = new ShowOrderController(showOrderUseCase);

  return { showOrderUseCase, sut };
}

describe(ShowOrderController.name, () => {
  test('Should show order and return correct values', async () => {
    const { showOrderUseCase, sut } = makeSut();

    showOrderUseCase.execute.mockReturnValueOnce(
      Promise.resolve({ ...orderMock, orderItems: [orderItemMock] }),
    );

    const sutResult = await sut.handle(orderMock);

    expect(sutResult).toStrictEqual({
      statusCode: 200,
      body: { ...orderMock, orderItems: [orderItemMock] },
    });
    expect(showOrderUseCase.execute).toBeCalledWith(orderMock);
  });
});
