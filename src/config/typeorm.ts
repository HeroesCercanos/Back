import { DataSource, DataSourceOptions } from "typeorm";
import 'dotenv/config';
import { registerAs } from "@nestjs/config";


const config = {
    type: "postgres",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: ["dist/**/*.entity{.ts,.js}"],
    synchronize: false,
    logging: true, //me loguea las querys
    migrationsRun: true,
    migrations: ["dist/migrations/*{.ts,.js}"],
};

export default registerAs("typeorm", () => config);

export const connectionSource = new DataSource(config as DataSourceOptions);
