import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Chip,
  IconButton,
  Paper,
  Divider
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Category as CategoryIcon } from "@mui/icons-material";
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
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Category Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your spending categories and monthly budgets.
        </Typography>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          {error}
        </Paper>
      )}

      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon color="primary" /> Add New Category
        </Typography>
        <form onSubmit={handleCreate}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ flex: 2, minWidth: 200 }}
            />
            <TextField
              size="small"
              type="number"
              label="Monthly Budget (Default ₹1000)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              sx={{ flex: 1, minWidth: 150 }}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              sx={{ borderRadius: 2, px: 3 }}
            >
              Add
            </Button>
          </Box>
        </form>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {categories.map((category) => (
          <Card
            key={category._id}
            sx={{
              p: 2,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: '0.2s',
              '&:hover': { boxShadow: 4 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {editingId === category._id ? (
                <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                  <TextField
                    size="small"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    value={editingBudget}
                    onChange={(e) => setEditingBudget(e.target.value)}
                    sx={{ width: 120 }}
                  />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    {category.name}
                  </Typography>
                  <Chip
                    label={category.isDefault ? "System" : "Custom"}
                    size="small"
                    color={category.isDefault ? "warning" : "success"}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    Budget: ₹{category.monthlyBudget || 1000}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {!category.isDefault ? (
                <>
                  {editingId === category._id ? (
                    <IconButton color="primary" onClick={() => handleUpdate(category._id)}>
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton color="info" onClick={() => {
                      setEditingId(category._id);
                      setEditingName(category.name);
                      setEditingBudget(category.monthlyBudget || "");
                    }}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton color="error" onClick={() => handleDelete(category._id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  Protected
                </Typography>
              )}
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default CategoriesPage;
