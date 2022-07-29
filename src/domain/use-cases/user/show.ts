import { UserModel } from '@/domain/models'

export type RequestModel = { id: string }

export type ResponseModel = Omit<UserModel, 'password'>

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>
}
