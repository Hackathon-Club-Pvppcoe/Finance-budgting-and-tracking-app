import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
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
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Add Expense
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Record a new spending entry for your financial tracking.
        </Typography>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          {error}
        </Paper>
      )}

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <ExpenseForm categories={categories} submitLabel="Add Expense" onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
};

export default AddExpensePage;
