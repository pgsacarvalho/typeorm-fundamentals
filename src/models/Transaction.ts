import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column()
  value: number;

  @Column('timestamp')
  created_at: Date;

  @Column('timestamp')
  updated_at: Date;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}

export default Transaction;
