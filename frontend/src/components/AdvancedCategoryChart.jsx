import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const hexToRgba = (hex, alpha) => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const StyledText = styled('text')(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 16,
    fontWeight: 'bold',
}));

function PieCenterLabel({ children }) {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}

const pieColors = ["#0ea5e9", "#22c55e", "#f59e0b", "#f43f5e", "#a855f7", "#64748b", "#ec4899", "#8b5cf6"];

export default function AdvancedCategoryChart({ data = [] }) {
    const [view, setView] = React.useState('class');

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    const totalSpent = data.reduce((acc, item) => acc + item.total, 0);
    if (totalSpent === 0) return <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>No data to visualize.</Box>;

    // Prepare Titanic-like data from expenses
    // Each category is split into "Within Budget" and "Over Budget"
    const processedData = data.map((cat, index) => {
        const budget = cat.budget || 1000;
        const withinBudget = Math.min(cat.total, budget);
        const overBudget = Math.max(0, cat.total - budget);
        const color = pieColors[index % pieColors.length];

        return {
            name: cat.name,
            withinBudget,
            overBudget,
            total: cat.total,
            color,
        };
    });

    const categoryNames = processedData.map(d => d.name);

    // View by Category (Inner: Category, Outer: Within/Over Budget split)
    const classData = processedData.map(d => ({
        id: d.name,
        label: d.name,
        value: d.total,
        percentage: (d.total / totalSpent) * 100,
        color: d.color,
    }));

    const classSurvivalData = processedData.flatMap(d => {
        const segments = [];
        if (d.withinBudget > 0) {
            segments.push({
                id: `${d.name}-within`,
                label: 'Within',
                value: d.withinBudget,
                percentage: (d.withinBudget / d.total) * 100,
                color: d.color,
            });
        }
        if (d.overBudget > 0) {
            segments.push({
                id: `${d.name}-over`,
                label: 'Over',
                value: d.overBudget,
                percentage: (d.overBudget / d.total) * 100,
                color: `${d.color}80`, // 50% opacity for over budget portion of that category
            });
        }
        return segments;
    });

    // View by Survival (Inner: Overall Survived/Total Over, Outer: Category breakdown)
    const totalWithin = processedData.reduce((sum, d) => sum + d.withinBudget, 0);
    const totalOver = processedData.reduce((sum, d) => sum + d.overBudget, 0);

    const survivalData = [
        {
            id: 'Within',
            label: 'Within Budget',
            value: totalWithin,
            percentage: (totalWithin / totalSpent) * 100,
            color: "#22c55e", // Green
        },
        {
            id: 'Over',
            label: 'Over Budget',
            value: totalOver,
            percentage: (totalOver / totalSpent) * 100,
            color: "#f43f5e", // Red
        },
    ].filter(d => d.value > 0);

    const survivalClassData = [];
    // First, add all "within budget" portions of each category
    processedData.forEach(d => {
        if (d.withinBudget > 0) {
            survivalClassData.push({
                id: `${d.name}-within-survival`,
                label: `${d.name} (Within):`,
                value: d.withinBudget,
                percentage: (d.withinBudget / totalWithin) * 100,
                color: hexToRgba("#22c55e", 0.4 + (categoryNames.indexOf(d.name) % 5) * 0.15),
            });
        }
    });
    // Then, add all "over budget" portions
    processedData.forEach(d => {
        if (d.overBudget > 0) {
            survivalClassData.push({
                id: `${d.name}-over-survival`,
                label: `${d.name} (Over):`,
                value: d.overBudget,
                percentage: (d.overBudget / totalOver) * 100,
                color: hexToRgba("#f43f5e", 0.4 + (categoryNames.indexOf(d.name) % 5) * 0.15),
            });
        }
    });

    const innerRadius = 40;
    const middleRadius = 100;
    const outerRadius = 120;

    return (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                    {view === 'class' ? 'Splits categories by budget status' : 'Overall wallet health'}
                </Typography>
                <ToggleButtonGroup
                    color="primary"
                    size="small"
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    sx={{ '& .MuiToggleButton-root': { py: 0.5, px: 1.5, fontSize: '0.75rem' } }}
                >
                    <ToggleButton value="class">By Category</ToggleButton>
                    <ToggleButton value="survival">By Health</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', height: 320, width: '100%' }}>
                {view === 'class' ? (
                    <PieChart
                        series={[
                            {
                                innerRadius,
                                outerRadius: middleRadius,
                                data: classData,
                                arcLabel: (item) => `${item.id}`,
                                valueFormatter: ({ value }) =>
                                    `${currency(value)} (${((value / totalSpent) * 100).toFixed(0)}%)`,
                                highlightScope: { fade: 'global', highlight: 'item' },
                                highlighted: { additionalRadius: 2 },
                                cornerRadius: 2,
                            },
                            {
                                innerRadius: middleRadius + 4,
                                outerRadius: outerRadius + 10,
                                data: classSurvivalData,
                                arcLabel: (item) => `${item.percentage.toFixed(0)}%`,
                                arcLabelRadius: outerRadius + 25,
                                valueFormatter: ({ value }) =>
                                    `${currency(value)}`,
                                highlightScope: { fade: 'global', highlight: 'item' },
                                highlighted: { additionalRadius: 2 },
                                cornerRadius: 2,
                            },
                        ]}
                        sx={{
                            [`& .${pieArcLabelClasses.root}`]: {
                                fontSize: '10px',
                                fontWeight: 'bold',
                                fill: 'white',
                            },
                        }}
                        hideLegend
                    >
                        <PieCenterLabel>Spent</PieCenterLabel>
                    </PieChart>
                ) : (
                    <PieChart
                        series={[
                            {
                                innerRadius,
                                outerRadius: middleRadius,
                                data: survivalData,
                                arcLabel: (item) => `${item.id}`,
                                valueFormatter: ({ value }) =>
                                    `${currency(value)} (${((value / totalSpent) * 100).toFixed(0)}%)`,
                                highlightScope: { fade: 'global', highlight: 'item' },
                                highlighted: { additionalRadius: 2 },
                                cornerRadius: 2,
                            },
                            {
                                innerRadius: middleRadius + 4,
                                outerRadius: outerRadius + 10,
                                data: survivalClassData,
                                arcLabel: (item) => {
                                    const id = item.id || '';
                                    return `${id.split('-')[0].substring(0, 5)}`;
                                },
                                arcLabelRadius: outerRadius + 25,
                                valueFormatter: ({ value }) =>
                                    `${currency(value)}`,
                                highlightScope: { fade: 'global', highlight: 'item' },
                                highlighted: { additionalRadius: 2 },
                                cornerRadius: 2,
                            },
                        ]}
                        sx={{
                            [`& .${pieArcLabelClasses.root}`]: {
                                fontSize: '9px',
                                fill: '#64748b',
                            },
                        }}
                        hideLegend
                    >
                        <PieCenterLabel>Health</PieCenterLabel>
                    </PieChart>
                )}
            </Box>
        </Box>
    );
}
