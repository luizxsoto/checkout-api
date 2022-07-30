import { makeOrderModelMock } from '@tests/domain/mocks/models'

import {
  CreateOrderRepository,
  FindByOrderRepository,
  ListOrderRepository,
  RemoveOrderRepository,
  UpdateOrderRepository
} from '@/data/contracts/repositories'

export function makeOrderRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation((): FindByOrderRepository.ResponseModel => [makeOrderModelMock()]),
    list: jest
      .fn()
      .mockImplementation((): ListOrderRepository.ResponseModel => [makeOrderModelMock()]),
    create: jest
      .fn()
      .mockImplementation(
        (requestModel: CreateOrderRepository.RequestModel): CreateOrderRepository.ResponseModel =>
          requestModel.map((itemModel) => makeOrderModelMock(itemModel))
      ),
    update: jest
      .fn()
      .mockImplementation(
        (requestModel: UpdateOrderRepository.RequestModel): UpdateOrderRepository.ResponseModel => [
          makeOrderModelMock(requestModel[1])
        ]
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (requestModel: RemoveOrderRepository.RequestModel): RemoveOrderRepository.ResponseModel => [
          makeOrderModelMock(requestModel[0])
        ]
      )
  }
}
