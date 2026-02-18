import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const monthInputDefault = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ReportsPage = () => {
  const { token } = useAuth();
  const [monthValue, setMonthValue] = useState(monthInputDefault);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const loadSummary = async (monthYear) => {
    setError("");
    try {
      const [year, month] = monthYear.split("-");
      const data = await apiRequest(`/reports/monthly?month=${Number(month)}&year=${Number(year)}`, { token });
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSummary(monthValue);
  }, [monthValue, token]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Monthly Reports</h2>
          <p className="text-sm text-slate-500">Analyze category spending and recent trend lines.</p>
        </div>
        <input
          type="month"
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none"
        />
      </div>

      {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Spending</p>
          <p className="mt-1 text-xl font-semibold">{currency(summary?.total)}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Expense Count</p>
          <p className="mt-1 text-xl font-semibold">{summary?.expenseCount || 0}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Top Category</p>
          <p className="mt-1 text-xl font-semibold">
            {summary?.highestCategory ? summary.highestCategory.name : "No data"}
          </p>
        </article>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Category Spend ({monthValue})</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={summary?.byCategory || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => currency(value)} />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Last 6 Months Trend</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={summary?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => currency(value)} />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
};

export default ReportsPage;
