import { RemoveProductController } from '@/presentation/controllers';
import { makeProductModelMock } from '@tests/domain/mocks/models';
import { makeRemoveProductUseCaseStub } from '@tests/presentation/stubs/use-cases';

const productMock = makeProductModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: productMock })),
}));

function makeSut() {
  const removeProductUseCase = makeRemoveProductUseCaseStub();
  const sut = new RemoveProductController(removeProductUseCase);

  return { removeProductUseCase, sut };
}

describe(RemoveProductController.name, () => {
  test('Should remove product and return correct values', async () => {
    const { removeProductUseCase, sut } = makeSut();

    removeProductUseCase.execute.mockReturnValueOnce(Promise.resolve(productMock));

    const sutResult = await sut.handle(productMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: productMock });
    expect(removeProductUseCase.execute).toBeCalledWith(productMock);
  });
});
