import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const ormconfig: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost', // O 'db' si NestJS corre en un contenedor en la misma red que Postgres
    port: 4000,        // Ajusta el puerto al que mapeaste en docker-compose.yml
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [__dirname + '/**/*.entity.js'], // Busca las entidades
    synchronize: true, // ¡IMPORTANTE! Cambiar a 'false' en producción y usar migraciones
    logging: 'all', // Habilita el logging para ver las consultas SQL
};

export default ormconfig;