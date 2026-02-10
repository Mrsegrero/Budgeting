import { getTodayKey, daysBetween } from './utils.js';

export const calculateBudget = (state) => {
    const { balance, history, targetDays, targetStartDate } = state;
    const today = getTodayKey();

    // 1. Average Daily Expense
    const expensesSinceStart = history.filter(tx => 
        tx.type === "Expense" && tx.dateKey >= targetStartDate.split('T')[0]
    );
    
    const totalSpent = expensesSinceStart.reduce((sum, tx) => sum + tx.amount, 0);
    const elapsed = daysBetween(targetStartDate, today);
    const averageExpense = totalSpent > 0 ? totalSpent / elapsed : 0;

    // 2. Adaptive Remaining Days
    let remainingDays;
    if (averageExpense > 0) {
        remainingDays = Math.floor(balance / averageExpense);
    } else {
        remainingDays = targetDays;
    }

    /** * AUDIT FIX #1: Clamp adaptation downward only. 
     * Prevents budget from jumping up if you spend too fast.
     */
    remainingDays = Math.min(remainingDays, targetDays);
    remainingDays = Math.max(1, remainingDays);

    // 3. Daily Budget Calculation
    // Logic: DailyBudget = Balance / RemainingDays
    const dailyBudget = Math.floor(balance / remainingDays);

    // 4. Today's Progress
    const spentToday = history
        .filter(tx => tx.dateKey === today && tx.type === "Expense")
        .reduce((sum, tx) => sum + tx.amount, 0);

    /** * AUDIT FIX #4: Division-by-zero guard 
     */
    const percentUsed = dailyBudget > 0 ? (spentToday / dailyBudget) * 100 : 0;

    return {
        dailyBudget,
        remainingDays,
        spentToday,
        percentUsed
    };
};
