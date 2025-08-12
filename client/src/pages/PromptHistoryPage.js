import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getPromptHistory } from '../api';

export default function PromptHistoryPage() {
  const theme = useTheme();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getPromptHistory().then(res => setHistory(res.data));
  }, []);

  return (
    <Box sx={{ p:2, display:'flex', justifyContent:'center' }}>
      <Paper
        sx={{
          width:'100%', maxWidth:600, p:4,
          backgroundColor:
            theme.palette.mode==='light'
              ? 'rgba(255,255,255,0.8)'
              : 'rgba(0,0,0,0.75)',
          backdropFilter:'blur(8px)', boxShadow: theme.shadows[5], borderRadius:3
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            fontFamily: '"Cinzel Decorative", serif',
            textShadow:
              theme.palette.mode==='dark'
                ? '2px 2px 4px rgba(0,0,0,0.8)'
                : '1px 1px 2px rgba(255,255,255,0.6)'
          }}
        >
          Prompt History
        </Typography>

        <List>
          {history.map((p) => (
            <ListItem key={p.id}>
              <ListItemText
                primary={p.text}
                secondary={new Date(p.timestamp).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
