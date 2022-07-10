import { UpdateProductController } from '@/presentation/controllers';
import { makeProductModelMock } from '@tests/domain/mocks/models';
import { makeUpdateProductUseCaseStub } from '@tests/presentation/stubs/use-cases';

const productMock = makeProductModelMock();

function makeSut() {
  const updateProductUseCase = makeUpdateProductUseCaseStub();
  const sut = new UpdateProductController(updateProductUseCase);

  return { updateProductUseCase, sut };
}

describe(UpdateProductController.name, () => {
  test('Should update product and return correct values', async () => {
    const { updateProductUseCase, sut } = makeSut();

    updateProductUseCase.execute.mockReturnValueOnce(Promise.resolve(productMock));

    const sutResult = await sut.handle(productMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: productMock });
    expect(updateProductUseCase.execute).toBeCalledWith(productMock);
  });
});
