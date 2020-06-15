import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import uploadcCSV from '../config/uploadCSV';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadcCSV);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const allTransactions = await transactionsRepository.find({
    relations: ['category'],
  });

  const balance = await transactionsRepository.getBalance();

  const trasactionsWithBalance = {
    transactions: allTransactions,
    balance,
  };

  return response.json(trasactionsWithBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { type, title, category, value } = request.body;
  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    category,
    title,
    type,
    value,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();

    const transactionsImportaded = await importTransactionsService.execute(
      request.file.filename,
    );

    return response.json(transactionsImportaded);
  },
);

export default transactionsRouter;
