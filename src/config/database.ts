import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import { Part, PartComponent } from '../models/Part';

dotenv.config();

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'assembly_inventory',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: ["error"], // Only log errors
  logger: undefined, // Disable the logger
  maxQueryExecutionTime: undefined, // Disable query execution time logging
  entities: [Part, PartComponent],
  migrations: [],
  subscribers: [],
  // Performance optimizations
  cache: {
    duration: 60000, // Cache duration in milliseconds (1 minute)
    type: "database",
    tableName: "query_cache"
  },
  extra: {
    // Connection pool settings
    max: 20, // Maximum number of connections in the pool
    min: 5,  // Minimum number of connections in the pool
    idle: 10000 // Maximum time (ms) that a connection can be idle before being released
  },
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

export const AppDataSource = new DataSource(config); 