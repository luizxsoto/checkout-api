import { Hasher } from '@/data/contracts/cryptography';
import { FindByUserRepository, UpdateUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { UpdateUserUseCase } from '@/domain/use-cases';

export class DbUpdateUserUseCase implements UpdateUserUseCase.UseCase {
  constructor(
    private readonly updateUserRepository: UpdateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      UpdateUserUseCase.RequestModel,
      { users: UserModel[] }
    >,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: UpdateUserUseCase.RequestModel,
  ): Promise<UpdateUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const filters: Partial<UserModel>[] = [{ id: sanitizedRequestModel.id }];

    if (sanitizedRequestModel.email) filters.push({ email: sanitizedRequestModel.email });

    const users = await this.findByUserRepository.findBy(filters);

    await restValidation({ users });

    const [userUpdated] = await this.updateUserRepository.update(
      { id: sanitizedRequestModel.id },
      {
        ...sanitizedRequestModel,
        password:
          sanitizedRequestModel.password &&
          (await this.hasher.hash(sanitizedRequestModel.password)),
      },
    );

    const findedUserById = users.find((user) => user.id === sanitizedRequestModel.id);

    return { ...findedUserById, ...sanitizedRequestModel, ...userUpdated };
  }

  private sanitizeRequestModel(
    requestModel: UpdateUserUseCase.RequestModel,
  ): UpdateUserUseCase.RequestModel {
    return {
      id: requestModel.id,
      name: requestModel.name,
      email: requestModel.email,
      password: requestModel.password,
      roles: requestModel.roles,
    };
  }

  private async validateRequestModel(
    requestModel: UpdateUserUseCase.RequestModel,
  ): Promise<(validationData: { users: UserModel[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        name: [
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'name' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'email' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        password: [
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'password' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 20 }),
        ],
        roles: [
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
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'users',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
          name: [],
          email: [
            this.validatorService.rules.unique({
              dataEntity: 'users',
              ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
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
