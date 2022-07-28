import {
  CreateOrderItemRepository,
  FindByOrderItemRepository,
  ListOrderItemRepository,
  RemoveOrderItemRepository,
  UpdateOrderItemRepository,
} from '@/data/contracts/repositories';
import { makeOrderItemModelMock } from '@tests/domain/mocks/models';

export function makeOrderItemRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation(
        (): FindByOrderItemRepository.ResponseModel => [makeOrderItemModelMock()],
      ),
    list: jest
      .fn()
      .mockImplementation((): ListOrderItemRepository.ResponseModel => [makeOrderItemModelMock()]),
    create: jest
      .fn()
      .mockImplementation(
        (
          requestModel: CreateOrderItemRepository.RequestModel,
        ): CreateOrderItemRepository.ResponseModel =>
          requestModel.map((itemModel) => makeOrderItemModelMock(itemModel)),
      ),
    update: jest
      .fn()
      .mockImplementation(
        (
          requestModel: UpdateOrderItemRepository.RequestModel,
        ): UpdateOrderItemRepository.ResponseModel => [makeOrderItemModelMock(requestModel[1])],
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (
          requestModel: RemoveOrderItemRepository.RequestModel,
        ): RemoveOrderItemRepository.ResponseModel => [makeOrderItemModelMock(requestModel[0])],
      ),
  };
}
