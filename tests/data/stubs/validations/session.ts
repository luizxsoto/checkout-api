import { UserModel } from '@/domain/models';
import { CreateSessionUseCase } from '@/domain/use-cases';

export function makeCreateSessionValidationStub() {
  const thirdValidation = jest.fn(async (findedUser: UserModel): Promise<void> => {
    //
  });
  const secondValidation = jest.fn(
    async (validationData: {
      users: UserModel[];
    }): Promise<(findedUser: UserModel) => Promise<void>> => {
      return thirdValidation;
    },
  );
  const firstValidation = jest.fn(
    async (
      requestModel: CreateSessionUseCase.RequestModel,
    ): Promise<
      (validationData: { users: UserModel[] }) => Promise<(findedUser: UserModel) => Promise<void>>
    > => {
      return secondValidation;
    },
  );

  return { firstValidation, secondValidation, thirdValidation };
}
