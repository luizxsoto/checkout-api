/* eslint-disable import/order */
/* eslint-disable import/first */
/* eslint-disable import/newline-after-import */
import { setupModuleAlias } from './config/module-alias'
setupModuleAlias()

import { envConfig, setupApp } from './config'

function bootstrap(): void {
  const app = setupApp()

  app.listen(envConfig.port, () =>
    console.info(`🚀 - Server running at http://localhost:${envConfig.port}`)
  )
}

bootstrap()
