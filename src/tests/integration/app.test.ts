import request from 'supertest'
import server, { connectDB } from '../../server';
import { AuthController } from '../../controllers/AuthController';
import User from '../../models/User';
import * as authUtils from '../../utils/auth';
import * as jwtUtils from '../../utils/jwt';


describe('Authentication - Create Account', () => {

    it('should display validation errors when form is empty', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({})

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)

        expect(response.status).not.toBe(201)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()

    })

    it('should return 400 status code when the email is invalid', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({
                                "name": "Erik",
                                "password": "12345678",
                                "email": "not_valid_email"
                            })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)

        expect(response.status).not.toBe(201)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()

    })

    it('should return 400 status code when the password is less than 8 characters', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({
                                "name": "Erik",
                                "password": "short",
                                "email": "test@test.com"
                            })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)

        expect(response.body.errors[0].msg).toBe('El password es muy corto, mínimo 8 caracteres')
        expect(response.status).not.toBe(201)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()

    })

    it('should register a new user successfully', async () => {

        const userData = {
            "name": "Erik",
            "password": "password",
            "email": "test@test.com",
        }
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send(userData)


        expect(response.status).toBe(201)


        expect(response.status).not.toBe(400)
        expect(response.body).not.toHaveProperty('errors')

    })

    it('should return 409 status code conflict when a user is already registered', async () => {

        const userData = {
            "name": "Erik",
            "password": "password",
            "email": "test@test.com",
        }
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send(userData)


        expect(response.statusCode).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Un usuario con ese email ya esta registrado')
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('errors')

    })
})


describe('Authentication - Account Confirmation with Token', () => {
    it('should display error if token is empty or token is not valid', async () => {
        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({
                                "token": "not_valid"
                            })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Token no válido')
    })

    it('should display error if token doesnt exists', async () => {
        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({
                                "token": "123456"
                            })
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Token no válido')
        expect(response.status).not.toBe(200)
    })

    it('should confirm account with a valid token', async () => {
        const token = (globalThis as any).cashTrackrConfirmationToken;
        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({ token })
        expect(response.status).toBe(200)
        expect(response.body).toBe('Cuenta confirmada correctamente')
        expect(response.status).not.toBe(401)
    })
})


describe('Authentication - Login', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('shoul display validation errors when the form is empty', async () =>{
        const response = await request(server)
                                .post('/api/auth/login')
                                .send({})

        const loginMock = jest.spyOn(AuthController, 'login')
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2)
        expect(response.body.errors).not.toHaveLength(1)
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('shoul return 400 bad request when the email is invalid', async () =>{
        const response = await request(server)
                                .post('/api/auth/login')
                                .send({
                                    "password": "password",
                                    "email": "not_valid"
                                })

        const loginMock = jest.spyOn(AuthController, 'login')
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Email no válido')

        expect(response.body.errors).not.toHaveLength(2)
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('shoul return 404 error if the user is not found', async () =>{
        const response = await request(server)
                                .post('/api/auth/login')
                                .send({
                                    "password": "password",
                                    "email": "user_not_found@test.com"
                                })

        const loginMock = jest.spyOn(AuthController, 'login')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Usuario no encontrado')

        expect(response.status).not.toBe(200)
    })

    it('shoul return 403 error if the user account is not confirmed', async () =>{

        (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: false,
                password: 'hashedPassword',
                email: 'user_not_confirmed@test.com'
            });
        const response = await request(server)
                                .post('/api/auth/login')
                                .send({
                                    "password": "password",
                                    "email": "user_not_confirmed@test.com"
                                })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('La Cuenta no ha sido confirmada')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
    })
    
    it('shoul return 403 error if the user account is not confirmed', async () =>{

        const userData = {
            name: 'Test',
            password: 'password',
            email: 'user_not_confirmed@test.com'
        }

        await request(server)
                .post('/api/auth/create-account')
                .send(userData)
        const response = await request(server)
                                .post('/api/auth/login')
                                .send({
                                    "password": userData.password,
                                    "email": userData.email
                                })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('La Cuenta no ha sido confirmada')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
    })


    it('shoul return 401 if the password is incorrect', async () =>{

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: true,
                password: 'hashedPassword',
            });
        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(false)
        const response = await request(server)
                                .post('/api/auth/login')
                                .send({
                                    "password": "wrongPassword",
                                    "email": "test@test.com"
                                })

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Password Incorrecto')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(403)
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledTimes(1)

    })

    it('shoul return a JWT', async () =>{

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: true,
                password: 'hashedPassword',
            });
        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(true) // aca es asincrona por eso el resolve
        const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt_token') // esta es asi porque es sincrona

        const response = await request(server)
                                .post('/api/auth/login')
                                .send({
                                    "password": "correctPassword",
                                    "email": "test@test.com"
                                })
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual('jwt_token')
        
        expect(findOne).toHaveBeenCalled()
        expect(findOne).toHaveBeenCalledTimes(1)

        expect(checkPassword).toHaveBeenCalled()
        expect(checkPassword).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledWith('correctPassword', 'hashedPassword')

        expect(generateJWT).toHaveBeenCalled()
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(1)

    })
})

let jwt : string

async function authenticateUser() {
    const response = await request(server)
                        .post('/api/auth/login')
                        .send({
                            email: "test@test.com",
                            password: "password"
                        })

    jwt = response.body
    expect(response.status).toBe(200)
}

describe('GET /api/budgets', () => {
    
    beforeAll(() => {
        jest.restoreAllMocks() // esto es apra que el jwt que se genra lo sea jwt_token es decir el valor mockeado
        // Restaura las funciones de los jest.spy a su implementación original
    })
    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unautheticated access to budgets without a jwt', async () =>{
        const response = await request(server)
                            .get('/api/budgets')
        
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No Autorizado')
    })

    it('should reject unautheticated access to budgets without a valid jwt', async () =>{
        const response = await request(server)
                            .get('/api/budgets')
                            .auth('no_valid', { type: 'bearer'} )
        
        expect(response.status).toBe(500)
        expect(response.body.error).toBe('Token no válido')
    })

    it('should allow authenticated access to budgets with a valid jwt', async () =>{
        const response = await request(server)
                            .get('/api/budgets')
                            .auth(jwt, {type: 'bearer'})
        
        expect(response.body).toHaveLength(0)
        expect(response.status).not.toBe(401)
        expect(response.body.error).not.toBe('No Autorizado')
    })

    
})

describe('POST /api/budgets', () => {

    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unautheticated post request to budgets without a jwt', async () =>{
        const response = await request(server)
                            .post('/api/budgets')
        
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No Autorizado')
    })

    it('should display validation when the form is submitted with invalid data', async () =>{
        const response = await request(server)
                            .post('/api/budgets')
                            .auth(jwt, { type: 'bearer' })
                            .send({})
        
        expect(response.status).toBe(400)
        expect(response.body.errors).toHaveLength(4)
    })

    it('should a new budget and return a success message', async () =>{
        const response = await request(server)
                            .post('/api/budgets')
                            .auth(jwt, { type: 'bearer' })
                            .send({
                                "name": "Test Budget",
                                "amount": 4000
                            })
        expect(response.status).toBe(201)
        expect(response.body).toBe('Presupuesto Creado Correctamente')
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(401)
    
    })
})


describe('GET /api/budgets/:budgetId', () => {

    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unautheticated get request to budget id without a jwt', async () =>{
        const response = await request(server)
                            .get('/api/budgets/1')
        
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No Autorizado')
    })

    it('should return 400 bad request when id is not valid', async () =>{
        const response = await request(server)
                            .get('/api/budgets/not_valid')
                            .auth(jwt, { type: 'bearer' })
        
        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
        expect(response.body.errors).toBeTruthy()
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('ID no válido')

        expect(response.status).not.toBe(401)
        expect(response.body.error).not.toBe('No Autorizado')
    })

    it('should return 404 not found when a budget doesnt exists', async () =>{
        const response = await request(server)
                            .get('/api/budgets/3000')
                            .auth(jwt, { type: 'bearer' })
        
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Presupuesto no encontrado')
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(401)
    })

    it('should return a single budget by id', async () =>{
        const response = await request(server)
                            .get('/api/budgets/1')
                            .auth(jwt, { type: 'bearer' })
        
        expect(response.status).toBe(200)
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(404)
    })
})



describe('PUT /api/budgets/:budgetId', () => {

    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unautheticated put request to budget id without a jwt', async () =>{
        const response = await request(server)
                            .put('/api/budgets/1')
        
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No Autorizado')
    })

    it('should display validation erros if the form is empty', async () =>{
        const response = await request(server)
                            .put('/api/budgets/1')
                            .auth(jwt, {type: 'bearer'})
                            .send({})
        
        expect(response.status).toBe(400)
        expect(response.body.errors).toBeTruthy()
        expect(response.body.errors).toHaveLength(4)
    })

    it('should update a budget id and return a success message', async () =>{
        const response = await request(server)
                            .put('/api/budgets/1')
                            .auth(jwt, {type: 'bearer'})
                            .send({
                                name: 'Updated Budget',
                                amount: 300
                            })
        
        expect(response.status).toBe(200)
        expect(response.body).toBe('Presupuesto actualizado correctamente')
    })

})


describe('DELETE /api/budgets/:budgetId', () => {

    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unautheticated delete request to budget id without a jwt', async () =>{
        const response = await request(server)
                            .delete('/api/budgets/1')
        
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No Autorizado')
    })

    it('should return 404 not found when a budget doesnt exits', async () =>{
        const response = await request(server)
                            .put('/api/budgets/3000')
                            .auth(jwt, {type: 'bearer'})

        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Presupuesto no encontrado')
    })

    it('should delete a budget and return a success message', async () =>{
        const response = await request(server)
                            .delete('/api/budgets/1')
                            .auth(jwt, {type: 'bearer'})
        
        expect(response.status).toBe(200)
        expect(response.body).toBe('Presupuesto eliminado correctamente')
    })

})