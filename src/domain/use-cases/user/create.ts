import { UserModel } from '@/domain/models'

export type RequestModel = Omit<
  UserModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export type ResponseModel = Omit<UserModel, 'password'>

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>
}
