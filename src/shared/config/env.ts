export const envConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3333,
  dbURL: process.env.DB_URL ?? 'postgres://postgres:postgres@localhost:5432/checkout',
};
