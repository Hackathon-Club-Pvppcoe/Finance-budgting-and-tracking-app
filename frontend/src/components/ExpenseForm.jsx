import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";

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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            name="amount"
            required
            value={form.amount}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0.01" }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              name="categoryId"
              value={form.categoryId}
              label="Category"
              onChange={handleChange}
            >
              <MenuItem value=""><em>Select Category</em></MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            name="date"
            required
            value={form.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Note (optional)"
            name="note"
            multiline
            rows={3}
            value={form.note}
            onChange={handleChange}
            placeholder="Add a quick note..."
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ px: 4, borderRadius: 2 }}
              disableElevation
            >
              {submitLabel}
            </Button>
            {onCancel && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpenseForm;
