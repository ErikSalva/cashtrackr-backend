import { Table, Column, DataType, HasMany, BelongsTo, ForeignKey, Model, AllowNull } from 'sequelize-typescript';
import Expense from './Expense';
import User from './User';


@Table({
    tableName: 'budgets'
})

class Budget extends Model{

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    // Usamos 'declare' para indicarle a TypeScript que estas propiedades existen en tiempo de ejecución,
    // pero no generamos una propiedad real en la clase para evitar sobrescribir los getters/setters
    // que Sequelize crea dinámicamente para manejar los atributos.
    declare name: string;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL
    })
    declare amount: number;

    @HasMany(() => Expense, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    declare expenses: Expense[]

    @ForeignKey(() => User)
    declare userId : number

    @BelongsTo(() => User)
    declare user: User

}

export default Budget;