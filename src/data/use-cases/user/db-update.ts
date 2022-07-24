import { Hasher } from '@/data/contracts/cryptography';
import { FindByUserRepository, UpdateUserRepository } from '@/data/contracts/repositories';
import { ValidationService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { UpdateUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export class DbUpdateUserUseCase implements UpdateUserUseCase.UseCase {
  constructor(
    private readonly updateUserRepository: UpdateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validationService: ValidationService.Validator,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: UpdateUserUseCase.RequestModel,
  ): Promise<UpdateUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const filters: Partial<UserModel>[] = [{ id: sanitizedRequestModel.id }];

    if (sanitizedRequestModel.email) filters.push({ email: sanitizedRequestModel.email });

    const users = await this.findByUserRepository.findBy(filters, true);

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

    const responseModel = { ...findedUserById, ...sanitizedRequestModel, ...userUpdated };
    Reflect.deleteProperty(responseModel, 'password');

    return responseModel;
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
  ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> {
    await this.validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
        name: new ValidationBuilder()
          .string()
          .regex({ pattern: 'name' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        email: new ValidationBuilder()
          .string()
          .regex({ pattern: 'email' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        password: new ValidationBuilder()
          .string()
          .regex({ pattern: 'password' })
          .length({ minLength: 6, maxLength: 20 })
          .build(),
        roles: new ValidationBuilder()
          .array(
            {
              validations: new ValidationBuilder()
                .string()
                .in({ values: ['admin', 'moderator'] })
                .build(),
            },
            this.validationService,
          )
          .distinct()
          .build(),
      },
      model: requestModel,
      data: {},
    });
    return (validationData) =>
      this.validationService.validate({
        schema: {
          id: new ValidationBuilder()
            .exists({ dataEntity: 'users', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
          email: new ValidationBuilder()
            .unique({
              dataEntity: 'users',
              ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
              props: [{ modelKey: 'email', dataKey: 'email' }],
            })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  }
}
