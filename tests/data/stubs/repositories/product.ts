import { makeProductModelMock } from '@tests/domain/mocks/models'

import {
  CreateProductRepository,
  FindByProductRepository,
  ListProductRepository,
  RemoveProductRepository,
  UpdateProductRepository
} from '@/data/contracts/repositories'

export function makeProductRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation((): FindByProductRepository.ResponseModel => [makeProductModelMock()]),
    list: jest.fn().mockImplementation(
      (): ListProductRepository.ResponseModel => ({
        page: 1,
        perPage: 20,
        lastPage: 1,
        total: 1,
        registers: [makeProductModelMock()]
      })
    ),
    create: jest
      .fn()
      .mockImplementation(
        (
          requestModel: CreateProductRepository.RequestModel
        ): CreateProductRepository.ResponseModel =>
          requestModel.map((itemModel) => makeProductModelMock(itemModel))
      ),
    update: jest
      .fn()
      .mockImplementation(
        (
          requestModel: UpdateProductRepository.RequestModel
        ): UpdateProductRepository.ResponseModel => [makeProductModelMock(requestModel[1])]
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (
          requestModel: RemoveProductRepository.RequestModel
        ): RemoveProductRepository.ResponseModel => [makeProductModelMock(requestModel[0])]
      )
  }
}
