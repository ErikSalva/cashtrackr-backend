import { Request, Response } from 'express'
import Budget from '../models/Budget'
import Expense from '../models/Expense';

export class BudgetController {

    getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                where: {
                    userId: req.user?.id
                }
            });

            res.status(200).json(budgets);
        } catch (error) {
            //console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const budget = await Budget.create(req.body);
            budget.userId = req.user?.id
            await budget.save();
            res.status(201).json('Presupuesto Creado Correctamente')
        } catch (error) {
            //console.log(error)
            res.status(500).json({error: 'Hubo un error'})
            
        }
    }

    getById = async (req: Request, res: Response) => {

        // Aca volvemos a hacer la consulta para no tner que agregar en include en el middleware y que las otras rutas
        // Tengan que consultar la tabla de expenses cada vez
        const budget = await Budget.findByPk(req.budget?.id, {
            include: [Expense]
        })
        res.status(200).json(budget)
    }

    updateById = async (req: Request, res: Response) => {
        await req.budget?.update(req.body)
        res.status(200).json('Presupuesto actualizado correctamente')
    }

    deleteById = async (req: Request, res: Response) => {
        await req.budget?.destroy()
        res.status(200).json('Presupuesto eliminado correctamente')
    }



}
