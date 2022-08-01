import { orderPaths } from './order'
import { productPaths } from './product'
import { sessionPaths } from './session'
import { userPaths } from './user'

export const paths = {
  ...sessionPaths,
  ...userPaths,
  ...productPaths,
  ...orderPaths
}
