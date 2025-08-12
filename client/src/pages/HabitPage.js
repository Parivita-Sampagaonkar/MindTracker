import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getRecommendations } from '../api';

export default function HabitPage() {
  const theme = useTheme();
  const location = useLocation();
  const mood = location.state?.mood;
  const [habitsInput, setHabitsInput] = useState('');
  const [recs, setRecs]               = useState([]);
  const [loading, setLoading]         = useState(false);

  if (!mood) {
    // Redirect if accessed directly
    return <Navigate to="/" replace />;
  }

  const handleGetRecs = async () => {
    const prev = habitsInput
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const { data } = await getRecommendations({ mood, habits: prev });
      setRecs(data.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          Habit Recommendations for “{mood}”
        </Typography>

        <Typography gutterBottom sx={{ color: theme.palette.text.secondary }}>
          Enter habits you’ve already done today (comma-separated):
        </Typography>
        <TextField
          fullWidth
          value={habitsInput}
          onChange={e => setHabitsInput(e.target.value)}
          placeholder="e.g., meditation, journaling"
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleGetRecs}
          disabled={loading}
          sx={{
            mb: 2,
            '&:hover': {
              boxShadow: theme.shadows[10],
              transform: 'scale(1.03)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Show Recommendations
        </Button>

        <List>
          {recs.map((r, i) => (
            <ListItem key={i}>{r}</ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
