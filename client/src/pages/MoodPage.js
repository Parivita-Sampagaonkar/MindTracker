import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

export default function MoodPage() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data;

  if (!data) {
    // Redirect back to journal if no data
    return <Navigate to="/" replace />;
  }

  const { mood, compound, neg, neu, pos } = data;
  const chartData = [
    { name: 'Positive', value: pos },
    { name: 'Neutral',  value: neu },
    { name: 'Negative', value: neg }
  ];
  const COLORS = ['#4caf50', '#9e9e9e', '#f44336'];

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 600,
          p: 4,
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.8)'
              : 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          boxShadow: theme.shadows[5],
          borderRadius: 3
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            textShadow:
              theme.palette.mode === 'dark'
                ? '2px 2px 4px rgba(0,0,0,0.8)'
                : '1px 1px 2px rgba(255,255,255,0.6)'
          }}
        >
          Your Mood: {mood.toUpperCase()}
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ color: theme.palette.text.secondary }}
        >
          (Compound score: {compound})
        </Typography>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <Button
          variant="contained"
          onClick={() => navigate('/habits', { state: { mood } })}
          sx={{
            mt: 2,
            '&:hover': {
              boxShadow: theme.shadows[10],
              transform: 'scale(1.03)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Get Habit Recommendations
        </Button>
      </Paper>
    </Box>
  );
}
