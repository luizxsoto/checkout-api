import { BaseModel } from './base'

export type ProductModel = BaseModel & {
  name: string
  category: 'clothes' | 'shoes' | 'others'
  colors: Array<'black' | 'white' | 'blue' | 'red' | 'other'>
  image: string
  price: number
}
