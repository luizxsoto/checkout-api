import {
  CreateProductRepository,
  FindByProductRepository,
  ListProductRepository,
  RemoveProductRepository,
  UpdateProductRepository,
} from '@/data/contracts/repositories';
import { makeProductModelMock } from '@tests/domain/mocks/models';

export function makeProductRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation((): FindByProductRepository.ResponseModel => [makeProductModelMock()]),
    list: jest
      .fn()
      .mockImplementation((): ListProductRepository.ResponseModel => [makeProductModelMock()]),
    create: jest
      .fn()
      .mockImplementation(
        (
          requestModel: CreateProductRepository.RequestModel,
        ): CreateProductRepository.ResponseModel => makeProductModelMock(requestModel),
      ),
    update: jest
      .fn()
      .mockImplementation(
        (
          requestModel: UpdateProductRepository.RequestModel,
        ): UpdateProductRepository.ResponseModel => [makeProductModelMock(requestModel[1])],
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (
          requestModel: RemoveProductRepository.RequestModel,
        ): RemoveProductRepository.ResponseModel => [makeProductModelMock(requestModel[0])],
      ),
  };
}
