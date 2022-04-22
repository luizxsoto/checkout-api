import { setupApp } from '@/app';
import { envConfig } from '@/shared/config';

export function bootstrap(): void {
  const app = setupApp();

  app.listen(envConfig.port, () =>
    console.log(`🚀 - Server running at http://localhost:${envConfig.port}`),
  );
}

bootstrap();
