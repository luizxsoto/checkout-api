import { OrderModel } from '@/domain/models';
import { RemoveOrderUseCase } from '@/domain/use-cases';

export type RemoveOrderValidation = (
  requestModel: RemoveOrderUseCase.RequestModel,
) => Promise<(validationData: { orders: OrderModel[] }) => Promise<void>>;
