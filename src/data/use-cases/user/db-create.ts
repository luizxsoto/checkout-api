import { Hasher } from '@/data/contracts/cryptography';
import { CreateUserRepository, FindByUserRepository } from '@/data/contracts/repositories';
import { CreateUserValidation } from '@/data/contracts/validations';
import { CreateUserUseCase } from '@/domain/use-cases';

export class DbCreateUserUseCase implements CreateUserUseCase.UseCase {
  constructor(
    private readonly createUserRepository: CreateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly createUserValidation: CreateUserValidation,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: CreateUserUseCase.RequestModel,
  ): Promise<CreateUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.createUserValidation(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy(
      [{ email: sanitizedRequestModel.email }],
      true,
    );

    await restValidation({ users });

    const [userCreated] = await this.createUserRepository.create([
      {
        ...sanitizedRequestModel,
        password: await this.hasher.hash(sanitizedRequestModel.password),
      },
    ]);

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
}
