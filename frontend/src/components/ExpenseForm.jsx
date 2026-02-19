import { useEffect, useState } from "react";

const toInputDate = (value) => new Date(value).toISOString().slice(0, 10);

const ExpenseForm = ({ categories, initialValues, onSubmit, submitLabel, onCancel }) => {
  const [form, setForm] = useState({
    amount: "",
    categoryId: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  useEffect(() => {
    if (!initialValues) return;
    setForm({
      amount: initialValues.amount?.toString() || "",
      categoryId: initialValues.categoryId?._id || initialValues.categoryId || "",
      date: initialValues.date ? toInputDate(initialValues.date) : new Date().toISOString().slice(0, 10),
      note: initialValues.note || "",
    });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      amount: Number(form.amount),
      categoryId: form.categoryId,
      date: form.date,
      note: form.note,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          Amount (₹)
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="amount"
            required
            value={form.amount}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none"
          />
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          Category
          <select
            name="categoryId"
            required
            value={form.categoryId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1 text-sm text-slate-700">
        Date
        <input
          type="date"
          name="date"
          required
          value={form.date}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none"
        />
      </label>

      <label className="space-y-1 text-sm text-slate-700">
        Note (optional)
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          rows={3}
          placeholder="Add a quick note..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default ExpenseForm;
