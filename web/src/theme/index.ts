import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#FF4B2B',
            light: '#FF6B4A',
            dark: '#CC3C22',
            contrastText: '#FFFFFF'
        },
        secondary: {
            main: '#2B2B2B',
            light: '#404040',
            dark: '#1A1A1A',
            contrastText: '#FFFFFF'
        },
        background: {
            default: '#F5F5F5',
            paper: '#FFFFFF'
        },
        text: {
            primary: '#2B2B2B',
            secondary: '#666666'
        }
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
            lineHeight: 1.2
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.3
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.4
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 24px'
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8
                    }
                }
            }
        }
    },
    shape: {
        borderRadius: 8
    }
});

export default theme; 