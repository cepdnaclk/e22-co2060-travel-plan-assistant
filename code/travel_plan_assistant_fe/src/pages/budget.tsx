import { useState } from "react";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export function Budget() {
  const [totalBudget, setTotalBudget] = useState(5000);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, category: "Accommodation", description: "Hotel booking", amount: 1200, date: "2026-03-15" },
    { id: 2, category: "Transportation", description: "Flight tickets", amount: 800, date: "2026-03-10" },
    { id: 3, category: "Food", description: "Restaurant dinner", amount: 150, date: "2026-03-16" },
    { id: 4, category: "Activities", description: "Museum tickets", amount: 75, date: "2026-03-17" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Food",
    description: "",
    amount: "",
    date: "",
  });

  const categories = ["Accommodation", "Transportation", "Food", "Activities", "Shopping", "Other"];

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      setExpenses([
        ...expenses,
        {
          id: Date.now(),
          category: newExpense.category,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          date: newExpense.date || new Date().toISOString().split("T")[0],
        },
      ]);
      setNewExpense({
        category: "Food",
        description: "",
        amount: "",
        date: "",
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const percentageSpent = (totalSpent / totalBudget) * 100;

  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Tracker</h1>
          <p className="text-gray-600">Manage your travel expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Lunch at restaurant"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
              <Button onClick={handleAddExpense} className="w-full">
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Budget</p>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Spent</p>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Remaining</p>
            <TrendingDown className="w-5 h-5 text-green-500" />
          </div>
          <p className={`text-3xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${Math.abs(remaining).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Budget Progress</h3>
            <span className="text-sm text-gray-600">{percentageSpent.toFixed(1)}% used</span>
          </div>
          <Progress value={percentageSpent} className="h-3" />
          <p className="text-sm text-gray-600">
            {remaining >= 0
              ? `You have $${remaining.toLocaleString()} left to spend`
              : `You are over budget by $${Math.abs(remaining).toLocaleString()}`}
          </p>
        </div>
      </Card>

      {/* Expenses by Category */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Expenses by Category</h3>
        <div className="space-y-4">
          {Object.entries(expensesByCategory).map(([category, amount]) => {
            const percentage = (amount / totalSpent) * 100;
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium">${amount.toLocaleString()}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Expense List */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
        ) : (
          <div className="space-y-3">
            {expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {expense.category}
                      </span>
                      <span className="text-sm text-gray-500">{expense.date}</span>
                    </div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      ${expense.amount.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
