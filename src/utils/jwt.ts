import jwt from 'jsonwebtoken'

export const generateJWT = ( id: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT environment variables are not properly defined');
    }
    const token = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })

    return token
}