import { ListPaymentProfileController } from '@/presentation/controllers';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';
import { makeListPaymentProfileUseCaseStub } from '@tests/presentation/stubs/use-cases';

const paymentProfileMock = makePaymentProfileModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: [paymentProfileMock] })),
}));

function makeSut() {
  const listPaymentProfileUseCase = makeListPaymentProfileUseCaseStub();
  const sut = new ListPaymentProfileController(listPaymentProfileUseCase);

  return { listPaymentProfileUseCase, sut };
}

describe(ListPaymentProfileController.name, () => {
  test('Should list paymentProfile and return correct values', async () => {
    const { listPaymentProfileUseCase, sut } = makeSut();

    listPaymentProfileUseCase.execute.mockReturnValueOnce(Promise.resolve([paymentProfileMock]));

    const sutResult = await sut.handle({});

    expect(sutResult).toStrictEqual({ statusCode: 200, body: [paymentProfileMock] });
    expect(listPaymentProfileUseCase.execute).toBeCalledWith({});
  });
});
