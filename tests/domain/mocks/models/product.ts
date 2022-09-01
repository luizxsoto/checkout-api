import { makeBaseModelMock } from './base'

import { ProductModel } from '@/domain/models'

export function makeProductModelMock(extraData?: Partial<ProductModel>) {
  return {
    ...makeBaseModelMock(extraData),
    name: 'Any Name',
    category: 'others' as const,
    colors: ['other'] as ProductModel['colors'],
    image: 'any-image.com',
    price: 1000,
    ...extraData
  }
}
