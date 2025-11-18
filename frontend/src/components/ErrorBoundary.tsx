import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface State {
  hasError: boolean;
  error?: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Uncaught error in component tree:', error, info);
  }

  handleReload = () => {
    // Try a hard reload
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Something went wrong</Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 600, textAlign: 'center' }}>
            An unexpected error occurred in the application. You can try reloading the page. If the problem persists, check the browser console for details.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>Reload</Button>
        </Box>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
