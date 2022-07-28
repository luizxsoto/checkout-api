import { DbShowProductUseCase } from '@/data/use-cases';
import { makeProductRepositoryStub } from '@tests/data/stubs/repositories';
import { makeShowProductValidationStub } from '@tests/data/stubs/validations';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

function makeSut() {
  const productRepository = makeProductRepositoryStub();
  const showProductValidation = makeShowProductValidationStub();
  const sut = new DbShowProductUseCase(productRepository, showProductValidation.firstValidation);

  return { productRepository, showProductValidation, sut };
}

describe(DbShowProductUseCase.name, () => {
  test('Should show product and return correct values', async () => {
    const { productRepository, showProductValidation, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel };
    const existsProduct = { ...responseModel };

    productRepository.findBy.mockReturnValueOnce([existsProduct]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(showProductValidation.firstValidation).toBeCalledWith(sanitizedRequestModel);
    expect(productRepository.findBy).toBeCalledWith([sanitizedRequestModel]);
    expect(showProductValidation.secondValidation).toBeCalledWith({ products: [existsProduct] });
  });

  test('Should throws if firstValidation throws', async () => {
    const { showProductValidation, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const error = new Error('firstValidation Error');

    showProductValidation.firstValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });

  test('Should throws if secondValidation throws', async () => {
    const { showProductValidation, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const error = new Error('secondValidation Error');

    showProductValidation.secondValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });
});
