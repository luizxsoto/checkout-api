import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import {
  CreatePaymentProfileRepository,
  FindByPaymentProfileRepository,
  ListPaymentProfileRepository,
  RemovePaymentProfileRepository,
  UpdatePaymentProfileRepository,
} from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { PaymentProfileModel, SessionModel } from '@/domain/models';

type Repositories = FindByPaymentProfileRepository.Repository &
  CreatePaymentProfileRepository.Repository &
  UpdatePaymentProfileRepository.Repository &
  RemovePaymentProfileRepository.Repository;

export class KnexPaymentProfileRepository extends KnexBaseRepository implements Repositories {
  constructor(session: SessionModel, knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(session, knex, uuidService, 'payment_profiles');
  }

  private sanitizeResponse(paymentProfiles: PaymentProfileModel[]) {
    return paymentProfiles.map(({ data, ...paymentProfile }) => {
      const { number, cvv, ...restData } =
        typeof data === 'string'
          ? JSON.parse(data)
          : (data as PaymentProfileModel<'CARD_PAYMENT'>['data']);
      const parsedData = restData as PaymentProfileModel<'CARD_PAYMENT'>['data'];
      if (paymentProfile.paymentMethod === 'PHONE_PAYMENT') parsedData.number = number;
      return { ...paymentProfile, data: parsedData };
    });
  }

  public async findBy(
    where: Partial<PaymentProfileModel>[],
    sanitizeResponse?: boolean,
  ): Promise<FindByPaymentProfileRepository.ResponseModel> {
    const paymentProfiles = await this.baseFind<PaymentProfileModel>(where);
    if (sanitizeResponse) return this.sanitizeResponse(paymentProfiles);
    return paymentProfiles;
  }

  public async list(
    requestModel: ListPaymentProfileRepository.RequestModel,
  ): Promise<ListPaymentProfileRepository.ResponseModel> {
    return this.baseList<PaymentProfileModel>(requestModel).then(this.sanitizeResponse);
  }

  public async create(
    requestModel: CreatePaymentProfileRepository.RequestModel,
  ): Promise<CreatePaymentProfileRepository.ResponseModel> {
    return this.baseCreate<PaymentProfileModel>(requestModel);
  }

  public async update(
    ...requestModel: UpdatePaymentProfileRepository.RequestModel
  ): Promise<UpdatePaymentProfileRepository.ResponseModel> {
    return this.baseUpdate<PaymentProfileModel>(...requestModel);
  }

  public async remove(
    ...requestModel: RemovePaymentProfileRepository.RequestModel
  ): Promise<RemovePaymentProfileRepository.ResponseModel> {
    return this.baseRemove<PaymentProfileModel>(...requestModel);
  }
}
