import { Encrypter } from '@/data/contracts/cryptography';
import { FindByUserRepository } from '@/data/contracts/repositories';
import { CreateSessionValidation } from '@/data/contracts/validations';
import { CreateSessionUseCase } from '@/domain/use-cases';

export class DbCreateSessionUseCase implements CreateSessionUseCase.UseCase {
  constructor(
    private readonly findByUserRepository: FindByUserRepository.Repository<'NORMAL'>,
    private readonly encrypter: Encrypter,
    private readonly createSessionValidation: CreateSessionValidation,
  ) {}

  async execute(
    requestModel: CreateSessionUseCase.RequestModel,
  ): Promise<CreateSessionUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const emailValidation = await this.createSessionValidation(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([{ email: sanitizedRequestModel.email }]);

    const passwordValidation = await emailValidation({ users });

    const [findedUser] = users;

    await passwordValidation(findedUser);

    const bearerToken = await this.encrypter.encrypt({
      userId: findedUser.id,
      roles: findedUser.roles,
    });

    const responseModel = { ...findedUser, bearerToken };
    Reflect.deleteProperty(responseModel, 'password');

    return responseModel;
  }

  private sanitizeRequestModel(
    requestModel: CreateSessionUseCase.RequestModel,
  ): CreateSessionUseCase.RequestModel {
    return {
      email: requestModel.email,
      password: requestModel.password,
    };
  }
}
