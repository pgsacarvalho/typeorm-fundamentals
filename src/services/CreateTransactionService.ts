import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface NewTransactionDTO {
  type: 'income' | 'outcome';
  title: string;
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    type,
    title,
    value,
    category,
  }: NewTransactionDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const currentBalance = await transactionRepository.getBalance();

      if (currentBalance.total < value) {
        throw new AppError('insufficient balance');
      }
    }

    const categoryRepository = getRepository(Category);

    let categoryData = await categoryRepository.findOne({ title: category });
    if (!categoryData) {
      categoryData = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryData);
    }
    const newTransaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryData,
    });

    await transactionRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
