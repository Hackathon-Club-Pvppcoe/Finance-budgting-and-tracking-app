import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import ExpenseForm from "../components/ExpenseForm";

const monthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DashboardPage = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const { month, year } = useMemo(monthYear, []);

  const loadData = useCallback(async () => {
    setError("");
    try {
      const [summaryData, expenseData, categoryData] = await Promise.all([
        apiRequest(`/reports/monthly?month=${month}&year=${year}`, { token }),
        apiRequest(`/expenses?month=${month}&year=${year}`, { token }),
        apiRequest("/categories", { token }),
      ]);
      setSummary(summaryData.summary);
      setExpenses(expenseData.expenses);
      setCategories(categoryData.categories);
    } catch (err) {
      setError(err.message);
    }
  }, [token, month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (expenseId) => {
    try {
      await apiRequest(`/expenses/${expenseId}`, { method: "DELETE", token });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await apiRequest(`/expenses/${editing._id}`, {
        method: "PUT",
        token,
        data: payload,
      });
      setEditing(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const pieColors = ["#0ea5e9", "#22c55e", "#f59e0b", "#f43f5e", "#a855f7", "#64748b"];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Monthly snapshot for {new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Monthly Spending" value={currency(summary?.total)} accent="bg-sky-600" />
        <StatCard
          title="Highest Category"
          value={summary?.highestCategory ? `${summary.highestCategory.name} (${currency(summary.highestCategory.total)})` : "No expenses"}
          accent="bg-amber-500"
        />
        <StatCard title="No. of Expenses" value={summary?.expenseCount || 0} accent="bg-emerald-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Category Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                   data={summary?.byCategory || []}
                   dataKey="total"
                   nameKey="name"
                   outerRadius={95}
                   label
                >
                  {(summary?.byCategory || []).map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Budget Status</h3>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {(summary?.byCategory || []).filter(c => (c.budget || 0) > 0).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No category budgets set.</p>
            ) : (
              (summary?.byCategory || [])
                .filter(c => (c.budget || 0) > 0)
                .map((cat) => {
                  const percent = Math.min((cat.total / cat.budget) * 100, 100);
                  const isOver = cat.total > cat.budget;
                  return (
                    <div key={cat.categoryId}>
                      <div className="mb-1 flex justify-between text-xs font-medium">
                        <span>{cat.name}</span>
                        <span className={isOver ? "text-rose-600" : "text-slate-600"}>
                          {currency(cat.total)} / {currency(cat.budget)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isOver ? "bg-rose-500" : percent > 80 ? "bg-amber-500" : "bg-sky-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </article>

        <article className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Spending Trends (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={summary?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => currency(value)} />
                <Bar dataKey="total" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      {editing ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Edit Expense</h3>
          <ExpenseForm
            categories={categories}
            initialValues={editing}
            submitLabel="Update Expense"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </article>
      ) : null}

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Expenses (Current Month)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Category</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Note</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className="border-t border-slate-100">
                  <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-2">{expense.categoryId?.name}</td>
                  <td className="py-2 font-medium">{currency(expense.amount)}</td>
                  <td className="py-2 text-slate-500">{expense.note || "-"}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(expense)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default DashboardPage;
