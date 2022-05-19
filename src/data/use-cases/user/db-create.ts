import { Hasher } from '@/data/contracts/cryptography';
import { CreateUserRepository, FindByUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { CreateUserUseCase } from '@/domain/use-cases';

export class DbCreateUserUseCase implements CreateUserUseCase.UseCase {
  constructor(
    private readonly createUserRepository: CreateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validator: ValidatorService.Validator<
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

    const users = await this.findByUserRepository.findBy([
      { email: sanitizedRequestModel.email },
      { username: sanitizedRequestModel.username },
    ]);

    await restValidation({ users });

    const repositoryResult = await this.createUserRepository.create({
      ...sanitizedRequestModel,
      password: await this.hasher.hash(sanitizedRequestModel.password),
    });

    return { ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: CreateUserUseCase.RequestModel,
  ): CreateUserUseCase.RequestModel {
    return {
      name: requestModel.name,
      email: requestModel.email,
      username: requestModel.username,
      password: requestModel.password,
    };
  }

  private async validateRequestModel(
    requestModel: CreateUserUseCase.RequestModel,
  ): Promise<(validationData: { users: UserModel[] }) => Promise<void>> {
    await this.validator.validate({
      schema: {
        name: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'name' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'email' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        username: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'username' }),
          this.validator.rules.length({ minLength: 6, maxLength: 20 }),
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
    return (validationData) =>
      this.validator.validate({
        schema: {
          name: [],
          email: [
            this.validator.rules.unique({
              dataEntity: 'users',
              props: [{ modelKey: 'email', dataKey: 'email' }],
            }),
          ],
          username: [
            this.validator.rules.unique({
              dataEntity: 'users',
              props: [{ modelKey: 'username', dataKey: 'username' }],
            }),
          ],
          password: [],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
