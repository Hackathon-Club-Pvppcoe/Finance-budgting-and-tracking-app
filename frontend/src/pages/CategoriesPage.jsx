import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const CategoriesPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingBudget, setEditingBudget] = useState("");
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiRequest("/categories", { token });
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("/categories", {
        method: "POST",
        token,
        data: { name, monthlyBudget: budget === "" ? 1000 : Number(budget) }
      });
      setName("");
      setBudget("");
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiRequest(`/categories/${id}`, { method: "DELETE", token });
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    setError("");
    try {
      await apiRequest(`/categories/${id}`, {
        method: "PUT",
        token,
        data: {
          name: editingName,
          monthlyBudget: editingBudget === "" ? 1000 : Number(editingBudget)
        },
      });
      setEditingId("");
      setEditingName("");
      setEditingBudget("");
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold">Category Management</h2>
        <p className="text-sm text-slate-500">Default categories are protected; add your own custom categories.</p>
      </div>

      {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="New category name"
          className="min-w-52 flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none"
        />
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget (Default: ₹1000)"
          className="w-32 rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none"
        />
        <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
          Add Category
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((category) => (
          <article
            key={category._id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {editingId === category._id ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                ) : (
                  <p className="truncate font-medium">{category.name}</p>
                )}
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${category.isDefault ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                >
                  {category.isDefault ? "Default" : "Custom"}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-slate-400">Budget:</span>
                {editingId === category._id ? (
                  <input
                    type="number"
                    value={editingBudget}
                    onChange={(e) => setEditingBudget(e.target.value)}
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                ) : (
                  <span className="text-sm font-semibold text-sky-700">
                    ₹{category.monthlyBudget || 1000}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {!category.isDefault ? (
                <>
                  {editingId === category._id ? (
                    <button
                      onClick={() => handleUpdate(category._id)}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(category._id);
                        setEditingName(category.name);
                        setEditingBudget(category.monthlyBudget || "");
                      }}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-500"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-400">Protected</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CategoriesPage;
