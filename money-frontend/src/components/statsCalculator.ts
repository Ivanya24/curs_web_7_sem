export interface CategoryExpense {
  category: string;
  totalAmount: number;
}

export interface DailyBalance {
  date: string;
  balance: number;
}

export interface DashboardStats {
  expensesByCategory: CategoryExpense[];
  balanceHistory: DailyBalance[];
}

export function calculateDashboardStats(transactions: any[]): DashboardStats {
  console.log("=== calculateDashboardStats вызвана ===");
  console.log("Всего транзакций:", transactions.length);
  console.log("Транзакции:", transactions);

  // 1. Расходы по категориям (круговая диаграмма)
  const categoryMap = new Map<string, number>();
  
  const expenses = transactions.filter(t => t.kind === 'Expense');
  console.log("Расходов найдено:", expenses.length);
  console.log("Расходы:", expenses);
  
  expenses.forEach(t => {
    const cat = t.category || "Прочее";
    const current = categoryMap.get(cat) || 0;
    categoryMap.set(cat, current + t.amount);
    console.log(`Категория "${cat}": ${current} + ${t.amount} = ${current + t.amount}`);
  });

  const expensesByCategory: CategoryExpense[] = Array.from(categoryMap.entries())
    .map(([category, totalAmount]) => {
      console.log(`Создаем объект: category="${category}", totalAmount=${totalAmount}`);
      return { category, totalAmount };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  console.log("Итоговые расходы по категориям:", expensesByCategory);

  // 2. Динамика баланса по дням (линейный график)
  const dailyMap = new Map<string, number>();
  
  transactions.forEach(t => {
    const dateKey = new Date(t.date).toLocaleDateString('ru-RU');
    const current = dailyMap.get(dateKey) || 0;
    
    const change = t.kind === 'Expense' ? -t.amount : t.amount;
    dailyMap.set(dateKey, current + change);
  });

  const sortedDays = Array.from(dailyMap.entries())
    .sort((a, b) => {
      const dateA = new Date(a[0].split('.').reverse().join('-'));
      const dateB = new Date(b[0].split('.').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

  let runningBalance = 0;
  const balanceHistory: DailyBalance[] = sortedDays.map(([date, dailyChange]) => {
    runningBalance += dailyChange;
    return { date, balance: runningBalance };
  });

  console.log("Итоговая история баланса:", balanceHistory);
  console.log("=== Функция завершена ===");

  return { expensesByCategory, balanceHistory };
}