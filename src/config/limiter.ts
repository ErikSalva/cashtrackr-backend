import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.NODE_ENV === 'production' ? 5 : 100, // cantidad de request permitidas durante el tiempo del windowMS
    message: {'error': 'Has alcanzado el límite de peticiones'}


})