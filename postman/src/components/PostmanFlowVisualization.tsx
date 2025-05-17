import { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface PostmanFlowVisualizationProps {
  postmanCollection: any;
}

const CollectionNode = ({ data }: { data: any }) => {
  return (
    <div
      style={{
        padding: '15px 20px',
        borderRadius: '5px',
        background: '#2196f3',
        color: 'white',
        width: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '14px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>{data.title}</div>
      <div style={{ fontSize: '14px' }}>{data.subtitle}</div>
    </div>
  );
};

const ApiEndpointNode = ({ data }: { data: any }) => {
  const method = data.method || 'GET';

  const getMethodColors = (method: string) => {
    switch (method) {
      case 'GET':
        return { bg: '#4caf50', light: '#e8f5e9', text: '#1b5e20' };
      case 'POST':
        return { bg: '#ffc107', light: '#fff8e1', text: '#ff6f00' };
      case 'PUT':
        return { bg: '#2196f3', light: '#e3f2fd', text: '#0d47a1' };
      case 'DELETE':
        return { bg: '#f44336', light: '#ffebee', text: '#b71c1c' };
      case 'PATCH':
        return { bg: '#9c27b0', light: '#f3e5f5', text: '#4a148c' };
      default:
        return { bg: '#9e9e9e', light: '#f5f5f5', text: '#212121' };
    }
  };

  const colors = getMethodColors(method);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          padding: '15px',
          background: colors.bg,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '80px',
        }}
      >
        {method}
      </div>

      <div
        style={{
          padding: '12px 20px',
          background: colors.light,
          flexGrow: 1,
          color: colors.text,
          borderTopRightRadius: '4px',
          borderBottomRightRadius: '4px',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            marginBottom: '5px',
            fontSize: '16px',
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            fontSize: '14px',
            color: '#1565c0',
          }}
        >
          {method} {getDomainFromUrl(data.url)}
        </div>
      </div>
    </div>
  );
};

const getDomainFromUrl = (url: string): string => {
  try {
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
};

const PostmanFlowVisualization = ({ postmanCollection }: PostmanFlowVisualizationProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!postmanCollection) return;

    try {
      const collection = postmanCollection.content;
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      newNodes.push({
        id: 'collection',
        type: 'default',
        data: {
          label: (
            <CollectionNode
              data={{
                title: collection.info?.name || 'Collection 1',
                subtitle: `${collection.item?.length || 0} items`,
              }}
            />
          ),
        },
        position: { x: 100, y: 200 },
        style: {
          width: 240,
          border: 'none',
          boxShadow: 'none',
          borderRadius: '8px',
        },
        sourcePosition: Position.Right,
      });

      const getAllEndpoints = (items: any[]) => {
        if (!items || !items.length) return;

        const processedEndpoints: Node[] = [];

        items.forEach((item, index) => {
          if (item.request) {
            const id = `endpoint-${index}`;
            const method = item.request.method || 'GET';
            let url = '';

            if (typeof item.request.url === 'string') {
              url = item.request.url;
            } else if (item.request.url?.raw) {
              url = item.request.url.raw;
            } else if (item.request.url?.path) {
              url = '/' + item.request.url.path.join('/');
            }

            const node: Node = {
              id,
              type: 'default',
              data: {
                label: (
                  <ApiEndpointNode
                    data={{
                      name: item.name,
                      method,
                      url,
                    }}
                  />
                ),
              },
              position: {
                x: 550,
                y: 100 + processedEndpoints.length * 150,
              },
              style: {
                width: 420,
                border: 'none',
                boxShadow: 'none',
                borderRadius: '0',
              },
              targetPosition: Position.Left,
            };

            processedEndpoints.push(node);
            newNodes.push(node);

            const getMethodColor = (method: string) => {
              switch (method) {
                case 'GET':
                  return '#4caf50';
                case 'POST':
                  return '#ffc107';
                case 'PUT':
                  return '#2196f3';
                case 'DELETE':
                  return '#f44336';
                case 'PATCH':
                  return '#9c27b0';
                default:
                  return '#9e9e9e';
              }
            };

            const edgeColor = getMethodColor(method);

            newEdges.push({
              id: `e-collection-${id}`,
              source: 'collection',
              target: id,
              animated: true,
              style: {
                strokeWidth: 3,
                stroke: edgeColor,
                strokeDasharray: '5,5',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: edgeColor,
              },
              type: 'default',
            });
          } else if (item.item) {
            getAllEndpoints(item.item);
          }
        });

        return processedEndpoints;
      };

      getAllEndpoints(collection.item);

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error creating flow visualization:', error);
    }
  }, [postmanCollection, setNodes, setEdges]);

  if (!postmanCollection) return null;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ mt: 4, height: 500, width: '100%', overflow: 'hidden' }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="subtitle1">API Flow Diagram</Typography>
        <Typography variant="body2" color="text.secondary">
          Visual representation of your Postman collection
        </Typography>
      </Box>

      <ReactFlowProvider>
        <div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodeOrigin={[0.5, 0.5]}
            nodesDraggable={true}
            elementsSelectable={false}
            nodesConnectable={false}
            panOnScroll={true}
            panOnDrag={true}
            minZoom={0.5}
            maxZoom={1.5}
            attributionPosition="bottom-left"
          >
            <Controls showInteractive={false} />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </Paper>
  );
};

export default PostmanFlowVisualization;