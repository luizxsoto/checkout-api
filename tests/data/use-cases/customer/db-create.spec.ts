import { DbCreateCustomerUseCase } from '@/data/use-cases';
import { makeCustomerRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbCreateCustomerUseCase(customerRepository, customerRepository, validatorService);

  return { customerRepository, validatorService, sut };
}

describe(DbCreateCustomerUseCase.name, () => {
  test('Should create customer and return correct values', async () => {
    const { customerRepository, sut } = makeSut();

    const requestModel = { name: 'any_name', email: 'any_email' };
    const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };

    customerRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toBe(responseModel);
  });
});
