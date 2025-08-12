// src/App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Box, Paper, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import JournalPage from './pages/JournalPage';
import MoodPage    from './pages/MoodPage';
import HabitPage   from './pages/HabitPage';
import HistoryPage from './pages/HistoryPage';
import PromptHistoryPage from './pages/PromptHistoryPage';

export default function App({ mode, toggleMode }) {
  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',  // distribute center & right
          px: 2,
          py: 1,
          bgcolor: 'secondary.main',
          opacity: 0.85,
          mb: 2,
          borderRadius: 2
        }}
      >
        {/* Centered links */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            '& a': {
              color: 'text.secondary',
              mx: 2,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.1rem'
            }
          }}
        >
          <Link to="/">Journal</Link>
          <Link to="/mood">Mood</Link>
          <Link to="/habits">Habits</Link>
          <Link to="/history">History</Link>
          <Link to="/prompts">Prompts</Link>

        </Box>

        {/* Theme toggle on right */}
        <IconButton onClick={toggleMode} color="inherit">
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Paper>

      <Routes>
        <Route path="/"       element={<JournalPage />} />
        <Route path="/mood"   element={<MoodPage    />} />
        <Route path="/habits" element={<HabitPage   />} />
        <Route path="/history"element={<HistoryPage/>} />
        <Route path="/prompts" element={<PromptHistoryPage />} />
        <Route path="*"       element={<h2>Not Found</h2>} />
      </Routes>
    </>
  );
}
