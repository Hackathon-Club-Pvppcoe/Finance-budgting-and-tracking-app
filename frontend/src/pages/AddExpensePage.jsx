import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const AddExpensePage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiRequest("/categories", { token });
        setCategories(data.categories);
      } catch (err) {
        setError(err.message);
      }
    };
    loadCategories();
  }, [token]);

  const handleCreate = async (payload) => {
    setError("");
    try {
      await apiRequest("/expenses", {
        method: "POST",
        token,
        data: payload,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold">Add Expense</h2>
        <p className="text-sm text-slate-500">Record a new spending entry for your monthly tracker.</p>
      </div>
      {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <ExpenseForm categories={categories} submitLabel="Add Expense" onSubmit={handleCreate} />
    </section>
  );
};

export default AddExpensePage;
