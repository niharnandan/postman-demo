import { Box, Typography, CircularProgress } from '@mui/material';
import { ReactFlowProvider } from 'reactflow';
import PostmanFlowVisualization from './PostmanFlowVisualization.tsx';

interface ApiVisualizerProps {
  postmanCollection: {
    name: string;
    content: any;
  } | null;
  isLoading?: boolean;
}

const ApiVisualizer = ({ postmanCollection, isLoading = false }: ApiVisualizerProps) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Processing Postman collection...
        </Typography>
      </Box>
    );
  }

  if (!postmanCollection) {
    return null;
  }

  const hasItems = postmanCollection.content?.item?.length > 0;

  if (!hasItems) {
    return (
      <Box
        sx={{
          mt: 4,
          p: 3,
          border: '1px solid #ddd',
          borderRadius: 1,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="body1" color="text.secondary" align="center">
          No API endpoints found in the collection. Please upload a Postman collection with
          requests.
        </Typography>
      </Box>
    );
  }

  return (
    <ReactFlowProvider>
      <Box sx={{ mt: 2 }}>
        <PostmanFlowVisualization postmanCollection={postmanCollection} />
      </Box>
    </ReactFlowProvider>
  );
};

export default ApiVisualizer;
