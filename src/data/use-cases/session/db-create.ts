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
    private readonly validatorService: ValidatorService.Validator<
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

    const bearerToken = await this.encrypter.encrypt({
      id: findedUser.id,
      roles: findedUser.roles,
    });

    return { ...findedUser, bearerToken };
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
    await this.validatorService.validate({
      schema: {
        email: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'email' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        password: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'password' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 20 }),
        ],
      },
      model: requestModel,
      data: { users: [] },
    });
    return async (validationData) => {
      await this.validatorService.validate({
        schema: {
          email: [
            this.validatorService.rules.exists({
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
        this.validatorService.validate({
          schema: {
            email: [],
            password: [
              this.validatorService.rules.custom({
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
