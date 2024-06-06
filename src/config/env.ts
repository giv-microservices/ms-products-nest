import 'dotenv/config';
import * as joi from 'joi';

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().default(3000),
    DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvConfig = value;

export const env = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
};
