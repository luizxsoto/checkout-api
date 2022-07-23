import { Hasher } from '@/data/contracts/cryptography';
import { CreateUserRepository, FindByUserRepository } from '@/data/contracts/repositories';
import { ValidationService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { CreateUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export class DbCreateUserUseCase implements CreateUserUseCase.UseCase {
  constructor(
    private readonly createUserRepository: CreateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validationService: ValidationService.Validator,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: CreateUserUseCase.RequestModel,
  ): Promise<CreateUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy(
      [{ email: sanitizedRequestModel.email }],
      true,
    );

    await restValidation({ users });

    const userCreated = await this.createUserRepository.create({
      ...sanitizedRequestModel,
      password: await this.hasher.hash(sanitizedRequestModel.password),
    });

    const responseModel = { ...sanitizedRequestModel, ...userCreated };
    Reflect.deleteProperty(responseModel, 'password');

    return responseModel;
  }

  private sanitizeRequestModel(
    requestModel: CreateUserUseCase.RequestModel,
  ): CreateUserUseCase.RequestModel {
    return {
      name: requestModel.name,
      email: requestModel.email,
      password: requestModel.password,
      roles: requestModel.roles,
    };
  }

  private async validateRequestModel(
    requestModel: CreateUserUseCase.RequestModel,
  ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> {
    await this.validationService.validate({
      schema: {
        name: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'name' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        email: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'email' })
          .length({ minLength: 6, maxLength: 100 })
          .build(),
        password: new ValidationBuilder()
          .required()
          .string()
          .regex({ pattern: 'password' })
          .length({ minLength: 6, maxLength: 20 })
          .build(),
        roles: new ValidationBuilder()
          .required()
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
          email: new ValidationBuilder()
            .unique({ dataEntity: 'users', props: [{ modelKey: 'email', dataKey: 'email' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  }
}
