// src/pages/JournalPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useTheme } from '@mui/material/styles';
import {
  analyzeMood,
  saveEntry,
  getPrompt,
  sendFeedback,
  getLastPrompt
} from '../api';

export default function JournalPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);

  const [promptText, setPromptText] = useState('');
  const [promptId, setPromptId] = useState(null);
  const [lastPrompt, setLastPrompt] = useState(null);

  // On mount: fetch a neutral prompt and the last prompt from session
  useEffect(() => {
    getPrompt('neutral').then(r => {
      setPromptText(r.data.prompt);
      setPromptId(r.data.prompt_id);
    }).catch(console.error);

    getLastPrompt().then(r => {
      setLastPrompt(r.data);
    }).catch(() => {
      // No last prompt yet
    });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await analyzeMood(entry);
      await saveEntry(entry);

      // Fetch a new prompt tailored to the detected mood
      const p = await getPrompt(data.mood);
      setPromptText(p.data.prompt);
      setPromptId(p.data.prompt_id);

      navigate('/mood', { state: { data } });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const giveFeedback = (type) => {
    if (!promptId) return;
    sendFeedback(promptId, type).catch(console.error);
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
            variant="subtitle1"
            sx={{ mb: 2,color: theme.palette.text.secondary }}
          >
            How are you feeling today?
          </Typography>
        

        <Typography
          variant="body2"
          sx={{ mb: 2, fontStyle: 'italic', color: theme.palette.text.secondary }}
        >
          💬 {promptText}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <IconButton onClick={() => giveFeedback('up')} color="primary">
            <ThumbUpIcon />
          </IconButton>
          <IconButton onClick={() => giveFeedback('down')} color="error">
            <ThumbDownIcon />
          </IconButton>
        </Box>

        <TextField
          multiline
          rows={6}
          fullWidth
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write your journal entry..."
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={!entry || loading}
          sx={{
            '&:hover': {
              boxShadow: theme.shadows[10],
              transform: 'scale(1.03)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Analyze Mood
        </Button>
      </Paper>
    </Box>
  );
}
