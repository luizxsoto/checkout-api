import { CreateProductController } from '@/presentation/controllers';
import { makeProductModelMock } from '@tests/domain/mocks/models';
import { makeCreateProductUseCaseStub } from '@tests/presentation/stubs/use-cases';

const productMock = makeProductModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  created: jest.fn(() => ({ statusCode: 201, body: productMock })),
}));

function makeSut() {
  const createProductUseCase = makeCreateProductUseCaseStub();
  const sut = new CreateProductController(createProductUseCase);

  return { createProductUseCase, sut };
}

describe(CreateProductController.name, () => {
  test('Should create product and return correct values', async () => {
    const { createProductUseCase, sut } = makeSut();

    createProductUseCase.execute.mockReturnValueOnce(Promise.resolve(productMock));

    const sutResult = await sut.handle(productMock);

    expect(sutResult).toStrictEqual({ statusCode: 201, body: productMock });
    expect(createProductUseCase.execute).toBeCalledWith(productMock);
  });
});