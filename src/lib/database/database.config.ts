// Config must be the first to be loaded, as it sets the env:
import '#root/config';

import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

export const AppDataSource: DataSource = new DataSource({
    type: 'postgres',
    host: process.env.PGSQL_DATABASE_HOST,
    port: Number(process.env.PGSQL_DATABASE_PORT),
    username: process.env.PGSQL_DATABASE_USER,
    password: process.env.PGSQL_DATABASE_PASSWORD,
    database: process.env.PGSQL_DATABASE_NAME,
	entities: [fileURLToPath(new URL('entities/*Entity.js', import.meta.url))],
	migrations: [fileURLToPath(new URL('migrations/*.js', import.meta.url))],
    synchronize: false,
    logging: false,
});

export const connect = (): Promise<DataSource> => AppDataSource.initialize();
