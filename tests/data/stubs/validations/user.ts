import { UserModel } from '@/domain/models'
import {
  CreateUserUseCase,
  ListUserUseCase,
  RemoveUserUseCase,
  ShowUserUseCase,
  UpdateUserUseCase
} from '@/domain/use-cases'

export function makeCreateUserValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { users: Omit<UserModel, 'password'>[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: CreateUserUseCase.RequestModel
    ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeListUserValidationStub() {
  const firstValidation = jest.fn(
    async (requestModel: ListUserUseCase.RequestModel): Promise<void> => {
      //
    }
  )

  return { firstValidation }
}

export function makeRemoveUserValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { users: Omit<UserModel, 'password'>[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: RemoveUserUseCase.RequestModel
    ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeShowUserValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { users: Omit<UserModel, 'password'>[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: ShowUserUseCase.RequestModel
    ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}

export function makeUpdateUserValidationStub() {
  const secondValidation = jest.fn(
    async (validationData: { users: Omit<UserModel, 'password'>[] }): Promise<void> => {
      //
    }
  )
  const firstValidation = jest.fn(
    async (
      requestModel: UpdateUserUseCase.RequestModel
    ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> => {
      return secondValidation
    }
  )

  return { firstValidation, secondValidation }
}
