import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const config = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email environment variables are not properly defined');
  }

  return {
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
}

export const transport = nodemailer.createTransport(config());