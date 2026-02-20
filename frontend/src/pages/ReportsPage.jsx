import { useEffect, useState, useMemo, useCallback } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";

const StyledText = styled("text")(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 18,
  fontWeight: "bold",
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

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
  const [pieView, setPieView] = useState("category");

  const loadSummary = useCallback(async (monthYear) => {
    setError("");
    try {
      const [year, month] = monthYear.split("-");
      const data = await apiRequest(`/reports/monthly?month=${Number(month)}&year=${Number(year)}`, { token });
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    loadSummary(monthValue);
  }, [monthValue, loadSummary]);

  const categorySummary = summary?.byCategory || [];
  const trendData = summary?.trend || [];
  const totalSpend = summary?.total || 0;
  const pieColors = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#8b5cf6", "#64748b"];

  // MUI Pie Data Preparation
  const classData = categorySummary.map((cat, idx) => ({
    id: cat.categoryId,
    label: cat.name,
    value: cat.total,
    color: pieColors[idx % pieColors.length],
  }));

  const classStatusData = categorySummary.map((cat, idx) => {
    const isOver = cat.total > (cat.budget || 1000);
    return {
      id: `${cat.categoryId}-status`,
      label: isOver ? "Over" : "Under",
      value: cat.total,
      color: isOver ? "#f43f5e" : pieColors[idx % pieColors.length],
    };
  });

  return (
    <section className="space-y-6">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <h2 className="text-2xl font-semibold">Financial Reports</h2>
          <p className="text-sm text-slate-500">In-depth analysis of your monthly spending habits.</p>
        </div>
        <input
          type="month"
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-400 focus:outline-none bg-white"
        />
      </Box>

      {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Spent" value={currency(summary?.total)} accent="bg-emerald-600" />
        <StatCard title="Transactions" value={summary?.expenseCount || 0} accent="bg-blue-600" />
        <StatCard
          title="Top Category"
          value={summary?.highestCategory ? summary.highestCategory.name : "N/A"}
          accent="bg-orange-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Category Spend ({monthValue})</h3>
            <ToggleButtonGroup
              size="small"
              value={pieView}
              exclusive
              onChange={(e, v) => v && setPieView(v)}
              color="primary"
            >
              <ToggleButton value="category">Details</ToggleButton>
              <ToggleButton value="budget">vs Budget</ToggleButton>
            </ToggleButtonGroup>
          </div>

          <div className="h-80 w-full flex justify-center">
            <PieChart
              series={[
                {
                  innerRadius: 60,
                  outerRadius: 110,
                  data: pieView === 'category' ? classData : classStatusData,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  highlightScope: { fade: 'global', highlight: 'item' },
                }
              ]}
              slotProps={{ legend: { hidden: true } }}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  display: 'none',
                },
              }}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            >
              <PieCenterLabel>{pieView === 'category' ? 'Spend' : 'Status'}</PieCenterLabel>
            </PieChart>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">6-Month Spending Trend</h3>
          <div className="h-80 w-full">
            <LineChart
              xAxis={[{
                data: trendData.map(d => d.label),
                scaleType: 'band'
              }]}
              series={[
                {
                  data: trendData.map(d => d.total),
                  color: '#3b82f6',
                  area: true
                },
              ]}
              height={320}
              margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
            />
          </div>
        </article>
      </div>
    </section>
  );
};

export default ReportsPage;
