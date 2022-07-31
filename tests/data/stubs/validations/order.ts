import { OrderModel, ProductModel, UserModel } from '@/domain/models'
import {
  CreateOrderUseCase,
  ListOrderUseCase,
  RemoveOrderUseCase,
  ShowOrderUseCase,
  UpdateOrderUseCase
} from '@/domain/use-cases'

export function makeCreateOrderValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { products: ProductModel[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: CreateOrderUseCase.RequestModel
    ): Promise<(validationData: { products: ProductModel[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeListOrderValidationStub() {
  const firstValidation = jest.fn(
    async (requestModel: ListOrderUseCase.RequestModel): Promise<void> => {
      //
    }
  )

  return { firstValidation }
}

export function makeRemoveOrderValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { orders: OrderModel[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: RemoveOrderUseCase.RequestModel
    ): Promise<(validationData: { orders: OrderModel[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeShowOrderValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { orders: OrderModel[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: ShowOrderUseCase.RequestModel
    ): Promise<(validationData: { orders: OrderModel[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeUpdateOrderValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: {
      orders: OrderModel[]
      users: Omit<UserModel, 'password'>[]
    }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: UpdateOrderUseCase.RequestModel
    ): Promise<
      (validationData: {
        orders: OrderModel[]
        users: Omit<UserModel, 'password'>[]
      }) => Promise<void>
    > => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}
