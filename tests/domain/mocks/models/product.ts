import { makeBaseModelMock } from './base'

import { ProductModel } from '@/domain/models'

export function makeProductModelMock(extraData?: Partial<ProductModel>) {
  return {
    ...makeBaseModelMock(extraData),
    name: 'Any Name',
    category: 'others' as ProductModel['category'],
    image: 'any-image.com',
    price: 1000,
    ...extraData,
  }
}
