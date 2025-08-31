import { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {

        const { email, password } = req.body
        // Prevenir duplicados
        const userExists = await User.findOne({ where: { email } })

        if (userExists) {
            const error = new Error('Un usuario con ese email ya esta registrado')
            return res.status(409).json({ error: error.message })
        }
        try {
            const user = await User.create(req.body)
            user.password = await hashPassword(password)
            const token = generateToken()

            if (process.env.NODE_ENV !== 'production') {
                (globalThis as any).cashTrackrConfirmationToken = token
            }
            user.token = token
            await user.save()

            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })
            res.status(201).json('Cuenta Creada Correctamente')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({ where: { token: token } })
        if (!user) {
            const error = new Error('Token no válido')
            return res.status(401).json({ error: error.message })
        }

        user.confirmed = true
        user.token = ''
        await user.save()

        res.status(200).json('Cuenta confirmada correctamente')
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        if (!user.confirmed) {
            const error = new Error('La Cuenta no ha sido confirmada')
            return res.status(403).json({ error: error.message })
        }

        const isPasswordCorrect = await checkPassword(password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('Password Incorrecto')
            return res.status(401).json({ error: error.message })
        }

        const token = generateJWT(user.id)
        res.status(200).json(token)

    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body

        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        user.token = generateToken()
        await user.save()

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.status(200).json('Revisa tu email para instrucciones')

    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body

        const tokenExits = await User.findOne({ where: { token } })

        if (!tokenExits) {
            const error = new Error('Token no válido')
            return res.status(404).json({ error: error.message })
        }

        res.status(200).json('Token válido, asigna un nuevo password')

    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({ where: { token } })

        if (!user) {
            const error = new Error('Token no válido')
            return res.status(404).json({ error: error.message })
        }
        // Asignar el nuevo password
        user.password = await hashPassword(password)
        user.token = ''
        await user.save()

        res.json('El password se modificó correctamente')
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const id = req.user?.id

        const user = await User.findByPk(id)

        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        const isPasswordCorrect = await checkPassword(current_password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto')
            return res.status(401).json({ error: error.message })
        }

        user.password = await hashPassword(password)
        await user.save()

        res.json('El password se modificó correctamente')
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const id = req.user?.id

        const user = await User.findByPk(id)

        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        const isPasswordCorrect = await checkPassword(password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto')
            return res.status(401).json({ error: error.message })
        }

        res.json('Password correcto')
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { email } = req.body
        const userExists = await User.findOne({ where: { email } })

        if (userExists && userExists.id !== req.user?.id) {
            const error = new Error('Un usuario con ese email ya esta registrado')
            return res.status(409).json({ error: error.message })
        }

        try {
            await req.user?.update(req.body)
            res.status(200).json('Perfil actualizado correctamente')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Hubo un error' })

        }

    }



}