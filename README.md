# 💰 CashTrackr Backend

Backend de **CashTrackr**, una aplicación para gestionar presupuestos y gastos personales.  
Esta API está construida con **TypeScript**, **Express** y **PostgreSQL**, y ofrece autenticación **JWT**, validaciones, **rate limiting** y un sistema completo de gestión de presupuestos y gastos.

---

## 🚀 Características

- Registro de usuarios con confirmación por email
- Login seguro con JWT
- Gestión completa de presupuestos (crear, leer, actualizar, eliminar)
- Sistema de gastos asociados a presupuestos
- Validación de datos con `express-validator`
- Rate limiting para protección contra ataques
- Tests unitarios y de integración

---

## 🛠️ Tecnologías principales

- TypeScript
- Express
- PostgreSQL (Sequelize)
- JWT
- bcrypt
- Nodemailer
- express-validator
- express-rate-limit
- Jest (Testing)

---

## 🔁 Endpoints principales

### Autenticación

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST   | /auth/create-account | ❌ | Registro de nuevo usuario |
| POST   | /auth/confirm-account | ❌ | Confirmación de cuenta con token |
| POST   | /auth/login | ❌ | Login y obtención de token |
| POST   | /auth/forgot-password | ❌ | Solicitar reset de password |
| POST   | /auth/validate-token | ❌ | Validar token de reset |
| POST   | /auth/reset-password/:token | ❌ | Resetear password con token |
| GET    | /auth/user | ✅ | Obtener perfil del usuario |
| PUT    | /auth/user | ✅ | Actualizar perfil |
| POST   | /auth/update-password | ✅ | Actualizar password |
| POST   | /auth/check-password | ✅ | Verificar password actual |

### Presupuestos

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET    | /budgets | ✅ | Obtener todos los presupuestos del usuario |
| POST   | /budgets | ✅ | Crear nuevo presupuesto |
| GET    | /budgets/:budgetId | ✅ | Obtener presupuesto específico |
| PUT    | /budgets/:budgetId | ✅ | Actualizar presupuesto |
| DELETE | /budgets/:budgetId | ✅ | Eliminar presupuesto |

### Gastos

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST   | /budgets/:budgetId/expenses | ✅ | Crear nuevo gasto |
| GET    | /budgets/:budgetId/expenses/:expenseId | ✅ | Obtener gasto específico |
| PUT    | /budgets/:budgetId/expenses/:expenseId | ✅ | Actualizar gasto |
| DELETE | /budgets/:budgetId/expenses/:expenseId | ✅ | Eliminar gasto |

---

## 🧪 Testing

El proyecto incluye tests unitarios y de integración:

**Tests de integración**
- Autenticación (registro, confirmación, login)
- Gestión de presupuestos (CRUD completo)
- Validación de rutas protegidas

**Tests unitarios**
- Controladores de autenticación
- Controladores de presupuestos
- Controladores de gastos
- Middlewares de validación

**Comandos de testing**
```bash
npm test                  # Ejecutar todos los tests
npm run test:coverage      # Ejecutar tests con reporte de cobertura
```
## 🔒 Seguridad

- Autenticación JWT
- Validación de datos con `express-validator`
- Rate limiting para endpoints sensibles
- Passwords hasheados con bcrypt
- Confirmación de email requerida

## 🌐 Deploy

El backend está desplegado en **Render** y podés acceder a la API en:

[https://cashtrackr-backend-to30.onrender.com](https://cashtrackr-backend-to30.onrender.com)

