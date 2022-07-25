import { ShowUserUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makeShowUserValidation } from '@/main/factories/validations';
import { makeValidationServiceStub } from '@tests/data/stubs/services';
import { makeUserModelMock } from '@tests/domain/mocks/models';

const existingUser = makeUserModelMock();
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const validationService = makeValidationServiceStub();
  const sut = makeShowUserValidation(validationService);

  return { validationService, sut };
}

describe(makeShowUserValidation.name, () => {
  describe.each([
    // id
    {
      properties: { id: undefined },
      validations: [{ field: 'id', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { id: 1 },
      validations: [{ field: 'id', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { id: 'invalid_uuid' },
      validations: [
        {
          field: 'id',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    {
      properties: { id: nonExistentId },
      validations: [{ field: 'id', rule: 'exists', message: 'This value was not found' }],
    },
  ])(
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = { ...properties } as ShowUserUseCase.RequestModel;

        let sutResult = await sut(requestModel).catch((e) => e);

        if (typeof sutResult === 'function') {
          sutResult = await sutResult({ users: [existingUser] }).catch((e: unknown) => e);
        }

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});
