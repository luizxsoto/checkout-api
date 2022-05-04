import './config/module-alias';
import { envConfig, setupApp } from './config';

function bootstrap(): void {
  const app = setupApp();

  app.listen(envConfig.port, () =>
    console.info(`🚀 - Server running at http://localhost:${envConfig.port}`),
  );
}

bootstrap();
