import * as components from './components'
import { paths } from './paths'
import * as schemas from './schemas'

export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Ecommerce API 🛒',
    description: 'Clean code / architecture POC application',
    version: '1.0.0',
    contact: {
      name: 'Luiz Soto',
      email: 'luizxsoto@gmail.com',
      url: 'https://www.linkedin.com/in/luizxsoto'
    }
  },
  externalDocs: { description: 'GitHub 😺', url: 'https://github.com/luizxsoto/ecommerce-api' },
  servers: [{ url: '/api', description: 'Production' }],
  tags: [
    { name: 'sessions', description: 'Session create' },
    { name: 'users', description: 'Users CRUD' },
    { name: 'products', description: 'Products CRUD' },
    { name: 'orders', description: 'Orders CRUD' }
  ],
  paths,
  schemas,
  components
}
