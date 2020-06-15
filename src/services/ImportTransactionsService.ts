import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository, getCustomRepository, In } from 'typeorm';

import uploadCSV from '../config/uploadCSV';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface ImportedCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(fileNameToImport: string): Promise<Transaction[]> {
    const csvPath = path.join(uploadCSV.directory, fileNameToImport);
    const readStream = fs.createReadStream(csvPath);
    const parsers = csvParse({ from_line: 2 });
    const parseCSV = readStream.pipe(parsers);

    const blah: Transaction[] = [];

    const importedTransactions: ImportedCSV[] = [];
    const importedCategories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((column: string) =>
        column.trim(),
      );

      importedCategories.push(category);
      importedTransactions.push({ title, type, value, category });
    }); // parseCSV on end

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoriesRepository = getRepository(Category);

    const categoriesAlreadyInserted = await categoriesRepository.find({
      title: In(importedCategories),
    });

    const categoriesTitles = categoriesAlreadyInserted.map(
      category => category.title,
    );

    const categoriesToAdd = importedCategories
      .filter(category => !categoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      categoriesToAdd.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const allCaterories = [...categoriesAlreadyInserted, ...newCategories];

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const newTransactions = transactionRepository.create(
      importedTransactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCaterories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(newTransactions);

    await fs.promises.unlink(csvPath);
    return newTransactions;
  }
}

export default ImportTransactionsService;
