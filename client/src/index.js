import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { lightTheme, darkTheme } from './theme';

function Root() {
  const hour = new Date().getHours();
  const [mode, setMode] = useState(hour >= 6 && hour < 18 ? 'light' : 'dark');
  const bgImage = mode === 'light' ? '/day.jpg' : '/night.jpg';

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease'
        }}
      >
        <BrowserRouter>
          <App mode={mode} toggleMode={() => setMode(m => m==='light'?'dark':'light')} />
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
