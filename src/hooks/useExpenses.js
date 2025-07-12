import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth.jsx';

export const useExpenses = (isAdminView = false) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(() => {
    setLoading(true);
    let allExpenses = JSON.parse(localStorage.getItem('bolt_visa_expenses') || '[]');
    
    const fixedExpenseTypes = ['office_rent', 'staff_salary', 'travel'];
    fixedExpenseTypes.forEach(type => {
        if (!allExpenses.find(exp => exp.type === type && exp.isRecurring)) {
            const defaults = {
                office_rent: { id: `fixed-${type}`, type: 'office_rent', title: 'Monthly Office Rent', amount: '1500', currency: 'AED', category: 'Fixed Expenses', description: 'Monthly office space rental', date: new Date().toISOString().split('T')[0], status: 'approved', isRecurring: true, createdAt: new Date().toISOString() },
                staff_salary: { id: `fixed-${type}`, type: 'staff_salary', title: 'Staff Salaries', amount: '6000', currency: 'AED', category: 'Fixed Expenses', description: 'Monthly staff salaries', date: new Date().toISOString().split('T')[0], status: 'approved', isRecurring: true, createdAt: new Date().toISOString() },
                travel: { id: `fixed-${type}`, type: 'travel', title: 'Business Travel Expenses', amount: '0', currency: 'AED', category: 'Fixed Expenses', description: 'Monthly travel and transportation costs', date: new Date().toISOString().split('T')[0], status: 'approved', isRecurring: true, createdAt: new Date().toISOString() },
            };
            if (defaults[type]) {
                allExpenses.push(defaults[type]);
            }
        }
    });
    localStorage.setItem('bolt_visa_expenses', JSON.stringify(allExpenses));


    if (isAdminView || user?.role === 'Admin') {
      setExpenses(allExpenses);
    } else if (user) {
      setExpenses(allExpenses.filter(expense => expense.userId === user.id && !expense.isRecurring));
    } else {
      setExpenses([]);
    }
    setLoading(false);
  }, [user, isAdminView]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = (expenseData) => {
    if (!user && !expenseData.isRecurring) return { success: false, error: "User not authenticated for non-recurring expense" };
    
    const allExpenses = JSON.parse(localStorage.getItem('bolt_visa_expenses') || '[]');
    const newExpense = {
      id: expenseData.id || Date.now().toString(), 
      ...expenseData,
      userId: expenseData.isRecurring ? 'system' : user.id,
      userName: expenseData.isRecurring ? 'System Fixed' : user.name,
      status: expenseData.isRecurring ? 'approved' : 'pending',
      createdAt: new Date().toISOString()
    };

    allExpenses.push(newExpense);
    localStorage.setItem('bolt_visa_expenses', JSON.stringify(allExpenses));
    loadExpenses();
    return { success: true };
  };

  const updateExpense = (id, updates) => {
    const allExpenses = JSON.parse(localStorage.getItem('bolt_visa_expenses') || '[]');
    const index = allExpenses.findIndex(expense => expense.id === id);
    
    if (index !== -1) {
      allExpenses[index] = { ...allExpenses[index], ...updates };
      localStorage.setItem('bolt_visa_expenses', JSON.stringify(allExpenses));
      loadExpenses();
      return { success: true };
    }
    return { success: false, error: 'Expense not found' };
  };

  const deleteExpense = (id) => {
    const allExpenses = JSON.parse(localStorage.getItem('bolt_visa_expenses') || '[]');
    const expenseToDelete = allExpenses.find(exp => exp.id === id);
    if (expenseToDelete && expenseToDelete.isRecurring) {
        return { success: false, error: 'Fixed recurring expenses cannot be deleted through this interface.' };
    }
    const filteredExpenses = allExpenses.filter(expense => expense.id !== id);
    localStorage.setItem('bolt_visa_expenses', JSON.stringify(filteredExpenses));
    loadExpenses();
    return { success: true };
  };

  const approveExpense = (id) => {
    return updateExpense(id, { status: 'approved', approvedAt: new Date().toISOString() });
  };

  const rejectExpense = (id, reason) => {
    return updateExpense(id, { status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason });
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    refreshExpenses: loadExpenses
  };
};