import { Hasher } from '@/data/contracts/cryptography';
import { CreateUserRepository, FindByUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { SessionModel, UserModel } from '@/domain/models';
import { CreateUserUseCase } from '@/domain/use-cases';

export class DbCreateUserUseCase implements CreateUserUseCase.UseCase {
  constructor(
    private readonly session: SessionModel,
    private readonly createUserRepository: CreateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      Partial<CreateUserUseCase.RequestModel>,
      { users: UserModel[] }
    >,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: CreateUserUseCase.RequestModel,
  ): Promise<CreateUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([{ email: sanitizedRequestModel.email }]);

    await restValidation({ users });

    const repositoryResult = await this.createUserRepository.create({
      ...sanitizedRequestModel,
      password: await this.hasher.hash(sanitizedRequestModel.password),
    });

    return { ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: CreateUserUseCase.RequestModel,
  ): CreateUserUseCase.RequestModel & { createUserId: string } {
    return {
      name: requestModel.name,
      email: requestModel.email,
      password: requestModel.password,
      roles: requestModel.roles,
      createUserId: this.session.userId,
    };
  }

  private async validateRequestModel(
    requestModel: CreateUserUseCase.RequestModel,
  ): Promise<(validationData: { users: UserModel[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        name: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'name' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
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
        roles: [
          this.validatorService.rules.required(),
          this.validatorService.rules.array({
            rules: [
              this.validatorService.rules.string(),
              this.validatorService.rules.in({ values: ['admin', 'moderator'] }),
            ],
          }),
        ],
      },
      model: requestModel,
      data: { users: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          name: [],
          email: [
            this.validatorService.rules.unique({
              dataEntity: 'users',
              props: [{ modelKey: 'email', dataKey: 'email' }],
            }),
          ],
          password: [],
          roles: [],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
