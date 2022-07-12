import { makeBaseModelMock } from './base';

import { ProductModel } from '@/domain/models';

export function makeProductModelMock(extraData?: Partial<ProductModel>) {
  return new ProductModel({
    ...makeBaseModelMock(extraData),
    name: 'Any Name',
    category: 'others',
    image: 'any-image.com',
    price: 1000,
    ...extraData,
  });
}
