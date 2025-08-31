import { Router } from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { handleInputErrors } from '../middleware/validation';
import { hasAccess, validateBudgetExits, validateBudgetId, validateBudgetInput } from '../middleware/budget';
import { ExpensesController } from '../controllers/ExpenseController';
import { belongsToBudget, validateExpenseExits, validateExpenseId, validateExpenseInput } from '../middleware/expense';
import { authenticate } from '../middleware/auth';

const router = Router();

const budgetController = new BudgetController();

router.use(authenticate)
// Esto es para que se ejecute la validación de ID antes de que se llegue a los métodos del controlador
// y de esta forma no es necesario repetir la validación en cada ruta
router.param('budgetId', validateBudgetId)
router.param('budgetId', validateBudgetExits)
router.param('budgetId', hasAccess)

router.param('expenseId', validateExpenseId)
router.param('expenseId', validateExpenseExits)
router.param('expenseId', belongsToBudget)


router.get('/', budgetController.getAll);

router.post('/', 
    validateBudgetInput,
    handleInputErrors,
    budgetController.create);

router.get('/:budgetId', budgetController.getById);

router.put('/:budgetId', 
    validateBudgetInput,
    handleInputErrors,
    budgetController.updateById);

router.delete('/:budgetId', budgetController.deleteById);


/* Routes for expenses */

/**Usamos el patron ROA */

router.post('/:budgetId/expenses', 
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.create)

router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById)

router.put('/:budgetId/expenses/:expenseId', 
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.updateById)

router.delete('/:budgetId/expenses/:expenseId', ExpensesController.deleteById)




export default router;