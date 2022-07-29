import { UserModel } from '@/domain/models'

export type RequestModel = Parameters<(where: Partial<UserModel>) => void>

export type ResponseModel = UserModel[]

export interface Repository {
  remove: (...requestModel: RequestModel) => Promise<ResponseModel>
}
