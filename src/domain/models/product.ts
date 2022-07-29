import { BaseModel } from './base'

export type ProductModel = BaseModel & {
  name: string
  category: 'clothes' | 'shoes' | 'others'
  image: string
  price: number
}
