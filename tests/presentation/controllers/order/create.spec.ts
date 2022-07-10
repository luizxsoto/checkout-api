import { CreateOrderController } from '@/presentation/controllers';
import { makeOrderItemModelMock, makeOrderModelMock } from '@tests/domain/mocks/models';
import { makeCreateOrderUseCaseStub } from '@tests/presentation/stubs/use-cases';

const orderMock = makeOrderModelMock();
const orderItemMock = makeOrderItemModelMock();

function makeSut() {
  const createOrderUseCase = makeCreateOrderUseCaseStub();
  const sut = new CreateOrderController(createOrderUseCase);

  return { createOrderUseCase, sut };
}

describe(CreateOrderController.name, () => {
  test('Should create order and return correct values', async () => {
    const { createOrderUseCase, sut } = makeSut();

    createOrderUseCase.execute.mockReturnValueOnce(
      Promise.resolve({ ...orderMock, orderItems: [orderItemMock] }),
    );

    const sutResult = await sut.handle({ ...orderMock, orderItems: [orderItemMock] });

    expect(sutResult).toStrictEqual({
      statusCode: 201,
      body: { ...orderMock, orderItems: [orderItemMock] },
    });
    expect(createOrderUseCase.execute).toBeCalledWith({
      ...orderMock,
      orderItems: [orderItemMock],
    });
  });
});
