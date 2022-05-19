import { Encrypter, HashComparer } from '@/data/contracts/cryptography';
import { FindByUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { CreateSessionUseCase } from '@/domain/use-cases';

export class DbCreateSessionUseCase implements CreateSessionUseCase.UseCase {
  constructor(
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly validator: ValidatorService.Validator<
      Partial<CreateSessionUseCase.RequestModel>,
      { users: UserModel[] }
    >,
  ) {}

  async execute(
    requestModel: CreateSessionUseCase.RequestModel,
  ): Promise<CreateSessionUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const emailValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([{ email: sanitizedRequestModel.email }]);

    const passwordValidation = await emailValidation({ users });

    const [findedUser] = users;

    await passwordValidation(findedUser);

    const accessToken = await this.encrypter.encrypt(findedUser.id);

    return { ...findedUser, accessToken };
  }

  private sanitizeRequestModel(
    requestModel: CreateSessionUseCase.RequestModel,
  ): CreateSessionUseCase.RequestModel {
    return {
      email: requestModel.email,
      password: requestModel.password,
    };
  }

  private async validateRequestModel(
    requestModel: CreateSessionUseCase.RequestModel,
  ): Promise<
    (validationData: { users: UserModel[] }) => Promise<(findedUser: UserModel) => Promise<void>>
  > {
    await this.validator.validate({
      schema: {
        email: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'email' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        password: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'password' }),
          this.validator.rules.length({ minLength: 6, maxLength: 20 }),
        ],
      },
      model: requestModel,
      data: { users: [] },
    });
    return async (validationData) => {
      await this.validator.validate({
        schema: {
          email: [
            this.validator.rules.exists({
              dataEntity: 'users',
              props: [{ modelKey: 'email', dataKey: 'email' }],
            }),
          ],
          password: [],
        },
        model: requestModel,
        data: validationData,
      });
      return (findedUser) =>
        this.validator.validate({
          schema: {
            email: [],
            password: [
              this.validator.rules.custom({
                validation: () =>
                  this.hashComparer.compare(requestModel.password, findedUser.password),
                rule: 'password',
                message: 'Wrong password',
              }),
            ],
          },
          model: requestModel,
          data: { users: [] },
        });
    };
  }
}
