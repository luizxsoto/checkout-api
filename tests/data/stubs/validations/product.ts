import { ProductModel } from '@/domain/models'
import {
  CreateProductUseCase,
  ListProductUseCase,
  RemoveProductUseCase,
  ShowProductUseCase,
  UpdateProductUseCase,
} from '@/domain/use-cases'

export function makeCreateProductValidationStub() {
  const firstValidation = jest.fn(
    async (requestModel: CreateProductUseCase.RequestModel): Promise<void> => {
      //
    }
  )

  return { firstValidation }
}

export function makeListProductValidationStub() {
  const firstValidation = jest.fn(
    async (requestModel: ListProductUseCase.RequestModel): Promise<void> => {
      //
    }
  )

  return { firstValidation }
}

export function makeRemoveProductValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { products: ProductModel[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: RemoveProductUseCase.RequestModel
    ): Promise<(validationData: { products: ProductModel[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeShowProductValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { products: ProductModel[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: ShowProductUseCase.RequestModel
    ): Promise<(validationData: { products: ProductModel[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeUpdateProductValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { products: ProductModel[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: UpdateProductUseCase.RequestModel
    ): Promise<(validationData: { products: ProductModel[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}
