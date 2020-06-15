import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const allTransactions = await this.find();

    let incomeSum = 0;
    let outcomeSum = 0;
    allTransactions.forEach(transaction => {
      if (transaction.type === 'income') incomeSum += Number(transaction.value);
      if (transaction.type === 'outcome')
        outcomeSum += Number(transaction.value);
    });

    return {
      income: incomeSum,
      outcome: outcomeSum,
      total: incomeSum - outcomeSum,
    };
  }
}

export default TransactionsRepository;
