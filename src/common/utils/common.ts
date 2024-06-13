import { DateFilter } from '../enums/user.enum';

export const generateRandomDigits = (n: number) => {
  return (
    Math.floor(Math.random() * (9 * Math.pow(10, n - 1))) + Math.pow(10, n - 1)
  );
};

export const calculateStartDate = (filter: DateFilter): Date => {
  const now = new Date();
  let startDate: Date;

  switch (filter) {
    case DateFilter.TODAY:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case DateFilter.WEEK:
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
      break;
    case DateFilter.MONTH:
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 30,
      );
      break;
    case DateFilter.YEAR:
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );
      break;
    default:
      throw new Error('Invalid filter');
  }

  return startDate;
};

export function calculateBalance(
  totalIncome: number,
  totalExpense: number,
): number {
  return totalIncome - totalExpense;
}
