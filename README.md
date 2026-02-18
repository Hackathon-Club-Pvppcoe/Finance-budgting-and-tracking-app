# Monthly Expense Tracker (MERN)

Full-stack monthly expense tracking application with:
- React + Tailwind CSS frontend
- Node.js + Express + MongoDB backend
- JWT authentication and bcrypt password hashing
- Protected, user-private categories and expenses
- Dashboard + monthly reports with chart visualizations

## Project Structure

```text
Finance-budgting-and-tracking-app/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
  frontend/
    src/
      api/
      components/
      context/
      pages/
```

## Features

- Auth: Register, Login, Protected routes (`JWT`)
- Categories:
  - Default categories: Food, Household, Medicines, Rent, Bills, Travel, Education, Others
  - Add custom categories
  - Default categories cannot be deleted
- Expenses:
  - Add, view, edit, delete expense entries
  - Fields: amount, category, date, optional note
- Dashboard:
  - Total monthly spending
  - Category-wise breakdown
  - Spending trend bar chart
  - Highest spending category highlight
- Reports:
  - Month selector
  - Category report and 6-month trend

## Backend Setup

1. Open terminal:
```bash
cd backend
```
2. Install dependencies:
```bash
npm install
```
3. Configure env:
```bash
cp .env.example .env
```
Set values in `.env`:
- `PORT=5000`
- `MONGO_URI=...`
- `JWT_SECRET=...`
4. Run backend:
```bash
npm run dev
```

## Frontend Setup

1. Open second terminal:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Configure env:
```bash
cp .env.example .env
```
4. Run frontend:
```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:5000`

## API Endpoints

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Categories:
  - `GET /api/categories`
  - `POST /api/categories`
  - `PUT /api/categories/:id`
  - `DELETE /api/categories/:id`
- Expenses:
  - `GET /api/expenses?month=MM&year=YYYY`
  - `POST /api/expenses`
  - `PUT /api/expenses/:id`
  - `DELETE /api/expenses/:id`
- Reports:
  - `GET /api/reports/monthly?month=MM&year=YYYY`
