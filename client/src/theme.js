import { createTheme } from '@mui/material/styles';

// load a fantasy font from Google in index.html:
// <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />

const common = {
    typography: {
        // default body font
        fontFamily: '"Merriweather", serif',
        // override individual heading levels
        h1: { fontFamily: '"Cinzel Decorative", serif' },
        h2: { fontFamily: '"Cinzel Decorative", serif' },
        h3: { fontFamily: '"Cinzel Decorative", serif' },
        h4: { fontFamily: '"Cinzel Decorative", serif' },
        h5: { fontFamily: '"Cinzel Decorative", serif' },
        h6: { fontFamily: '"Cinzel Decorative", serif' },
    },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.8)',  // translucent panels
          backdropFilter: 'blur(4px)',
        }
      }
    }
  }
};

export const lightTheme = createTheme({
  ...common,
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },    // moss green
    secondary: { main: '#8d6e63' },  // wood brown
    background: {
      default: '#e8f5e9',            // fallback pale green
      paper:   'rgba(255,255,255,0.8)'
    },
    text: {
      primary: '#1b5e20',            // dark fern
      secondary: '#4e342e'           // dark brown
    }
  }
});

export const darkTheme = createTheme({
  ...common,
  palette: {
    mode: 'dark',
    primary: { main: '#aed581' },    // fern green
    secondary: { main: '#5d4037' },  // deep brown
    background: {
      default: '#1b2a1a',            // very dark forest floor
      paper:   'rgba(0,0,0,0.6)'
    },
    text: {
      primary: '#e0f2f1',            // pale mint
      secondary: '#cfd8dc'           // grey-mint
    }
  }
});
