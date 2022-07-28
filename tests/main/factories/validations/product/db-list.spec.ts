import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
import { ListProductUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';
import { ValidationException } from '@/main/exceptions';
import { makeListProductValidation } from '@/main/factories/validations';
import { makeValidationServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const validationService = makeValidationServiceStub();
  const sut = makeListProductValidation(validationService);

  return { validationService, sut };
}

describe(makeListProductValidation.name, () => {
  describe.each([
    // page
    {
      properties: { page: 'page' },
      validations: [{ field: 'page', rule: 'integer', message: 'This value must be an integer' }],
    },
    {
      properties: { page: 0 },
      validations: [
        { field: 'page', rule: 'min', message: 'This value must be bigger or equal to: 1' },
      ],
    },
    // perPage
    {
      properties: { perPage: 'perPage' },
      validations: [
        { field: 'perPage', rule: 'integer', message: 'This value must be an integer' },
      ],
    },
    {
      properties: { perPage: MIN_PER_PAGE - 1 },
      validations: [
        { field: 'perPage', rule: 'min', message: 'This value must be bigger or equal to: 20' },
      ],
    },
    {
      properties: { perPage: MAX_PER_PAGE + 1 },
      validations: [
        { field: 'perPage', rule: 'max', message: 'This value must be less or equal to: 50' },
      ],
    },
    // orderBy
    {
      properties: { orderBy: 1 },
      validations: [{ field: 'orderBy', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { orderBy: 'orderBy' },
      validations: [
        {
          field: 'orderBy',
          rule: 'in',
          message: 'This value must be in: name, category, price, createdAt, updatedAt',
        },
      ],
    },
    // order
    {
      properties: { order: 1 },
      validations: [{ field: 'order', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { order: 'order' },
      validations: [{ field: 'order', rule: 'in', message: 'This value must be in: asc, desc' }],
    },
    // name
    {
      properties: { filters: '["=", "name", 1]' },
      validations: [
        { field: 'filters.name.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "name", "lower"]' },
      validations: [
        {
          field: 'filters.name.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 255',
        },
      ],
    },
    {
      properties: {
        filters:
          '["=", "name", "BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName Bigg"]',
      },
      validations: [
        {
          field: 'filters.name.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 255',
        },
      ],
    },
    // category
    {
      properties: { filters: '["=", "category", 1]' },
      validations: [
        { field: 'filters.category.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "category", "invalid_category"]' },
      validations: [
        {
          field: 'filters.category.0',
          rule: 'in',
          message: 'This value must be in: clothes, shoes, others',
        },
      ],
    },
    // price
    {
      properties: { filters: '["=", "price", 1.2]' },
      validations: [
        { field: 'filters.price.0', rule: 'integer', message: 'This value must be an integer' },
      ],
    },
    {
      properties: { filters: `["=", "price", ${MAX_INTEGER + 1}]` },
      validations: [
        {
          field: 'filters.price.0',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`,
        },
      ],
    },
    // createUserId
    {
      properties: { filters: '["=", "createUserId", 1]' },
      validations: [
        { field: 'filters.createUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.createUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    // updateUserId
    {
      properties: { filters: '["=", "updateUserId", 1]' },
      validations: [
        { field: 'filters.updateUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updateUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.updateUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    // createdAt
    {
      properties: { filters: '["=", "createdAt", 1]' },
      validations: [
        { field: 'filters.createdAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createdAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.createdAt.0',
          rule: 'date',
          message: 'This value must be a valid date',
        },
      ],
    },
    // updatedAt
    {
      properties: { filters: '["=", "updatedAt", 1]' },
      validations: [
        { field: 'filters.updatedAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updatedAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.updatedAt.0',
          rule: 'date',
          message: 'This value must be a valid date',
        },
      ],
    },
  ])(
    'Should throw ValidationException for every product invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          filters: '[]',
          ...properties,
        } as ListProductUseCase.RequestModel;

        const sutResult = await sut(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});
