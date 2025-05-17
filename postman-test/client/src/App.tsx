import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { 
  AppBar, 
  Box, 
  Button, 
  Chip, 
  CircularProgress, 
  Container, 
  Paper, 
  Toolbar, 
  Typography 
} from '@mui/material';
import type { ApiRoute, ApiResponse } from './types';
import './json-pretty.css';

const JSONPretty = ({ data }: { data: any }) => {
  const syntaxHighlight = (json: string) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const prettyJson = syntaxHighlight(JSON.stringify(data, null, 2));

  return (
    <pre 
      style={{ margin: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.875rem' }}
      dangerouslySetInnerHTML={{ __html: prettyJson }}
    />
  );
};

function App() {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:4005');

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('routes', (updatedRoutes: ApiRoute[]) => {
      console.log('Received updated routes:', updatedRoutes);
      if (updatedRoutes) {
        setSelectedRoute(null);
        setResponseData(null);
        setRoutes(updatedRoutes);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRouteClick = async (route: ApiRoute) => {
    try {
      setSelectedRoute(route.path);
      setLoading(true);
      
      const method = route.methods[0];
      
      const response = await fetch(`http://localhost:4005${route.path}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResponseData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponseData({ error: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            API Explorer
          </Typography>
          <Chip 
            label={isConnected ? "Connected" : "Disconnected"} 
            color={isConnected ? "success" : "error"}
            size="small"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>
      
      <Container 
        maxWidth="lg"
        sx={{ 
          mt: 3, 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Available Routes
          </Typography>
          
          {routes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No API routes detected. Add routes to the Express server.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {routes.map((route) => (
                <div key={route.path}>
                  {route.methods.map((method) => (
                    <Button
                      key={`${route.path}-${method}`}
                      variant={selectedRoute === route.path ? "contained" : "outlined"}
                      color="primary"
                      onClick={() => handleRouteClick(route)}
                      sx={{ mr: 1, mb: 1 }}
                      startIcon={
                        <Chip 
                          label={method} 
                          size="small" 
                          color={getMethodColor(method) as any}
                        />
                      }
                    >
                      {decodeURIComponent(route.path)}
                    </Button>
                  ))}
                </div>
              ))}
            </Box>
          )}
        </Paper>
        
        <Paper 
          sx={{ 
            p: 2, 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {selectedRoute ? decodeURIComponent(selectedRoute) : 'Click a Button/Route to show the response.'}
          </Typography>
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : responseData ? (
              <Box 
                sx={{ 
                  height: '100%', 
                  width: '100%', 
                  overflow: 'auto',
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <JSONPretty data={responseData} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Click on a route button above to fetch data
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;