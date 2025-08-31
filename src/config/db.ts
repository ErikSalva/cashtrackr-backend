import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config()

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in the environment variables');
}
export const db = new Sequelize( process.env.DATABASE_URL, {
    models: [__dirname + '/../models/**/*'], 
    dialectOptions:{
        ssl: {
            require: false
            
        }
    },
    logging: process.env.NODE_ENV !== 'production'
})

