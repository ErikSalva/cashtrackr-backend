import type { Request, Response, NextFunction } from 'express'
import { param, validationResult, body } from 'express-validator'
import Budget from '../models/Budget'

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}


export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {

    await param('budgetId')
            .isInt().withMessage('ID no válido').bail()
            .custom( value => value > 0).withMessage('ID no válido').bail()
            .run(req)
    // Usa el run para ejecutar la validación ya que no esta en el router y como no esta ahi no se ejecuta automaticamente
    let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
    next()
}


export const validateBudgetExits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId)

        if(!budget) {
            const error = new Error('Presupuesto no encontrado')
            return res.status(404).json({error: error.message})
        }
        
        req.budget = budget

        next()
    } catch (error) {
        //console.log(error)
        res.status(500).json({error: 'Hubo un error'})
    }
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {

    await body('name')
        .notEmpty().withMessage('El nombre del presupuesto no puede estar vacío').run(req)
    await body('amount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede estar vacía')
        .isNumeric().withMessage('Cantidad no válida')
        .custom( value => value > 0).withMessage('La cantidad del presupuesto debe ser mayor que 0').run(req)
        
    next()
}

export function hasAccess (req: Request, res: Response, next: NextFunction) {
    if(req.budget?.userId !== req.user?.id){
        const error = new Error('Acción no válida')
        return res.status(401).json({error: error.message})
    }       
    next()
}