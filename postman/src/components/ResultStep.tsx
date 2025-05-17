import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GetAppIcon from '@mui/icons-material/GetApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ChatPanel from './ChatPanel';

const CustomDialog = ({
  open,
  onClose,
  children,
  maxWidth = 'md',
  fullWidth = true,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}) => {
  if (!open) return null;

  const getWidth = () => {
    switch (maxWidth) {
      case 'xs':
        return '444px';
      case 'sm':
        return '600px';
      case 'md':
        return '900px';
      case 'lg':
        return '1200px';
      case 'xl':
        return '1536px';
      default:
        return '900px';
    }
  };

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
          width: fullWidth ? getWidth() : 'auto',
          maxWidth: fullWidth ? getWidth() : 'auto',
          maxHeight: 'calc(100% - 64px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

interface Endpoint {
  method: string;
  path: string;
  description?: string;
}

interface SetupStep {
  title: string;
  instructions: string;
}

interface SetupInstructions {
  experienceLevel: 'beginner' | 'experienced';
  steps: SetupStep[];
}

interface GeneratedCode {
  framework: string;
  files: Record<string, string>;
  endpoints: Endpoint[];
  setupInstructions?: SetupInstructions;
}

interface ResultStepProps {
  generatedCode: GeneratedCode | null;
  postmanCollection?: any;
}

interface FileNode {
  name: string;
  path: string;
  content: string;
}

interface DirectoryStructure {
  files?: FileNode[];
  dirs?: Record<string, DirectoryStructure>;
}

const ResultStep = ({ generatedCode, postmanCollection }: ResultStepProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});
  const [setupDialogOpen, setSetupDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleExpand = (path: string): void => {
    setExpandedFiles((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleDownloadAll = (): void => {
    if (!generatedCode) return;

    try {
      const zip = new JSZip();

      Object.entries(generatedCode.files).forEach(([path, content]) => {
        const fileContent =
          typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
        zip.file(path, fileContent);
      });

      zip
        .generateAsync({ type: 'blob' })
        .then((content) => {
          saveAs(content, `${generatedCode.framework}-api-server.zip`);
        })
        .catch((error) => {
          console.error('Error generating ZIP:', error);
          alert('Failed to generate ZIP file. Please try again.');
        });
    } catch (error) {
      console.error('Error in ZIP download process:', error);
      alert('Failed to prepare download. Please try again.');
    }
  };

  const handleCopyFile = (content: string): void => {
    const textToCopy = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert('File content copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  const handleFileSelect = (path: string): void => {
    setSelectedFile(path);
    if (isMobile) {
      setActiveTab(1);
    }
  };

  const handleOpenSetupDialog = (): void => {
    setSetupDialogOpen(true);
  };

  const handleCloseSetupDialog = (): void => {
    setSetupDialogOpen(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderCodeBlocks = (text: string): React.ReactNode => {
    const parts = text.split(/```(\w*)\n([\s\S]*?)```/g);
    const elements: React.ReactElement[] = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        if (parts[i]) {
          elements.push(
            <Typography key={`text-${i}`} variant="body2">
              {parts[i]}
            </Typography>,
          );
        }
      } else if (i % 3 === 1) {
        continue;
      } else if (i % 3 === 2) {
        elements.push(
          <Box
            key={`code-${i}`}
            component="pre"
            sx={{
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              mt: 1,
              mb: 2,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {parts[i]}
          </Box>,
        );
      }
    }

    return <>{elements}</>;
  };

  const renderSetupInstructions = (): React.ReactNode => {
    if (!generatedCode) return null;

    if (generatedCode.setupInstructions) {
      const { experienceLevel, steps } = generatedCode.setupInstructions;
      return (
        <>
          <Typography variant="h6" gutterBottom>
            Getting Started with Your Generated API
          </Typography>

          <Typography variant="body2" paragraph color="text.secondary">
            {experienceLevel === 'beginner'
              ? 'These detailed instructions will help you set up and run your new API server.'
              : 'Here are the key steps to implement and run your API server.'}
          </Typography>

          <Box sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {index + 1}. {step.title}
                </Typography>
                <Typography variant="body2" component="div" paragraph>
                  {step.instructions.includes('```')
                    ? renderCodeBlocks(step.instructions)
                    : step.instructions}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>
            API Endpoints
          </Typography>
          <Typography variant="body2" paragraph>
            Your API implements the following endpoints from your Postman collection:
          </Typography>

          <Paper variant="outlined" sx={{ maxHeight: '200px', overflow: 'auto' }}>
            <List dense>
              {generatedCode.endpoints &&
                generatedCode.endpoints.map((endpoint, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${endpoint.method} ${endpoint.path}`}
                      secondary={endpoint.description || 'No description provided'}
                    />
                  </ListItem>
                ))}
            </List>
          </Paper>
        </>
      );
    }

    return (
      <>
        <Typography variant="h6" gutterBottom>
          Getting Started with Your Generated API
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            1. Download and Extract
          </Typography>
          <Typography variant="body2" paragraph>
            Download the ZIP file containing all generated code files and extract it to your project
            directory.
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            2. Install Dependencies
          </Typography>
          <Typography variant="body2" component="div" paragraph>
            Open a terminal in the project directory and run:
            <Box
              component="pre"
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                mt: 1,
                overflow: 'auto',
              }}
            >
              {generatedCode.framework === 'express'
                ? 'npm install'
                : generatedCode.framework === 'flask'
                  ? 'pip install -r requirements.txt'
                  : 'pip install -r requirements.txt'}
            </Box>
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            3. Configure Your Environment
          </Typography>
          <Typography variant="body2" paragraph>
            Ensure your database is running and accessible using the connection URL you provided.
            Update the .env file if needed with any additional configuration.
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            4. Start the Server
          </Typography>
          <Typography variant="body2" component="div">
            Run the following command to start your API server:
            <Box
              component="pre"
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                mt: 1,
                overflow: 'auto',
              }}
            >
              {generatedCode.framework === 'express'
                ? 'npm start'
                : generatedCode.framework === 'flask'
                  ? 'flask run'
                  : 'python manage.py runserver'}
            </Box>
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          API Endpoints
        </Typography>
        <Typography variant="body2" paragraph>
          Your API implements the following endpoints from your Postman collection:
        </Typography>

        <Paper variant="outlined" sx={{ maxHeight: '200px', overflow: 'auto' }}>
          <List dense>
            {generatedCode.endpoints &&
              generatedCode.endpoints.map((endpoint, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${endpoint.method} ${endpoint.path}`}
                    secondary={endpoint.description || 'No description provided'}
                  />
                </ListItem>
              ))}
          </List>
        </Paper>
      </>
    );
  };

  const renderFileTree = (files: Record<string, string>, _basePath = ''): React.ReactNode => {
    const fileTree: DirectoryStructure = {};

    Object.keys(files).forEach((path) => {
      const parts = path.split('/');
      let currentLevel: DirectoryStructure = fileTree;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (!currentLevel.files) currentLevel.files = [];
          currentLevel.files.push({
            name: part,
            path: path,
            content: files[path],
          });
        } else {
          if (!currentLevel.dirs) currentLevel.dirs = {};
          if (!currentLevel.dirs[part]) {
            currentLevel.dirs[part] = {};
          }
          currentLevel = currentLevel.dirs[part];
        }
      });
    });

    const renderLevel = (node: DirectoryStructure, path = '', level = 0): React.ReactNode => {
      return (
        <>
          {node.dirs &&
            Object.entries(node.dirs).map(([dirName, dirNode]) => {
              const dirPath = path ? `${path}/${dirName}` : dirName;
              const isExpanded = expandedFiles[dirPath] !== false;

              return (
                <React.Fragment key={dirPath}>
                  <ListItem
                    disablePadding
                    sx={{
                      position: 'relative',
                      pl: level > 0 ? 2 : 0,
                    }}
                  >
                    {level > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          backgroundColor: 'divider',
                          ml: 1.5,
                        }}
                      />
                    )}

                    {level > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          width: '16px',
                          height: '1px',
                          backgroundColor: 'divider',
                          ml: 1.5,
                        }}
                      />
                    )}

                    <ListItemButton
                      onClick={() => toggleExpand(dirPath)}
                      sx={{
                        pl: level,
                        borderLeft: level > 0 ? 'none' : undefined,
                        ml: level > 0 ? 2 : 0,
                      }}
                    >
                      <ListItemIcon>
                        <FolderIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {dirName}
                          </Typography>
                        }
                      />
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>
                  </ListItem>

                  {isExpanded && (
                    <Box
                      component="div"
                      sx={{
                        display: 'block',
                        position: 'relative',
                        borderLeft: level > 0 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                        ml: level > 0 ? 1.5 : 0,
                      }}
                    >
                      {renderLevel(dirNode, dirPath, level + 1)}
                    </Box>
                  )}
                </React.Fragment>
              );
            })}

          {node.files &&
            node.files.map((file) => {
              const displayContent =
                typeof file.content === 'object'
                  ? JSON.stringify(file.content, null, 2)
                  : file.content;

              return (
                <ListItem
                  disablePadding
                  key={file.path}
                  sx={{
                    position: 'relative',
                    pl: level > 0 ? 2 : 0,
                  }}
                >
                  {level > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: '50%',
                        width: '1px',
                        backgroundColor: 'divider',
                        ml: 1.5,
                      }}
                    />
                  )}

                  {level > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        width: '16px',
                        height: '1px',
                        backgroundColor: 'divider',
                        ml: 1.5,
                      }}
                    />
                  )}

                  <ListItemButton
                    onClick={() => handleFileSelect(file.path)}
                    sx={{
                      pl: level,
                      ml: level > 0 ? 2 : 0,
                      borderRadius: 1,
                      bgcolor:
                        selectedFile === file.path ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        bgcolor:
                          selectedFile === file.path
                            ? 'rgba(25, 118, 210, 0.12)'
                            : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <InsertDriveFileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {file.path.split('/').slice(0, -1).join('/')}
                        </Typography>
                      }
                    />
                    <ContentCopyIcon
                      fontSize="small"
                      color="action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyFile(displayContent);
                      }}
                      sx={{
                        opacity: 0.6,
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </>
      );
    };

    return renderLevel(fileTree);
  };

  const renderFileDetails = (): React.ReactNode => {
    if (!generatedCode || !selectedFile) {
      return (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Select a file to view details
          </Typography>
        </Box>
      );
    }

    const fileContent = generatedCode.files[selectedFile];
    const fileName = selectedFile.split('/').pop() || '';

    let description = '';
    let purpose = '';

    if (
      selectedFile.includes('routes') ||
      selectedFile.includes('Route') ||
      selectedFile.includes('router')
    ) {
      description = 'Route Definition';
      purpose =
        'This file defines API endpoints and their corresponding handlers. It maps URLs to controller functions.';
    } else if (selectedFile.includes('controller') || selectedFile.includes('Controller')) {
      description = 'Controller';
      purpose =
        'This controller handles the business logic for API requests. It processes input, interacts with services or models, and returns responses.';
    } else if (selectedFile.includes('model') || selectedFile.includes('Model')) {
      description = 'Data Model';
      purpose =
        'This file defines the data structure for database interactions. It specifies the schema and validation rules.';
    } else if (selectedFile.includes('service') || selectedFile.includes('Service')) {
      description = 'Service';
      purpose =
        'This service handles business logic and data processing, separating these concerns from controllers.';
    } else if (selectedFile.includes('middleware')) {
      description = 'Middleware';
      purpose =
        'This middleware intercepts requests to perform operations like authentication, logging, or request validation.';
    } else if (selectedFile.includes('config')) {
      description = 'Configuration';
      purpose =
        'This file contains application configuration settings like database connections, environment variables, or app settings.';
    } else if (selectedFile.includes('utils') || selectedFile.includes('helpers')) {
      description = 'Utility/Helper';
      purpose =
        'This utility file provides reusable functions and helpers used throughout the application.';
    } else if (selectedFile === 'package.json' || selectedFile === 'requirements.txt') {
      description = 'Dependencies';
      purpose =
        'This file lists all required packages and dependencies needed to run the application.';
    } else if (
      selectedFile.includes('index') ||
      selectedFile.includes('app') ||
      selectedFile.includes('server')
    ) {
      description = 'Application Entry Point';
      purpose =
        'This is the main file that bootstraps the application, sets up middleware, and starts the server.';
    } else {
      description = 'Application File';
      purpose = 'This file is part of your API server implementation.';
    }

    let frameworkSpecific = '';
    if (generatedCode.framework === 'express') {
      if (selectedFile.includes('routes')) {
        frameworkSpecific =
          'Express routes use app.get(), app.post(), etc. to define HTTP method handlers.';
      } else if (selectedFile.includes('middleware')) {
        frameworkSpecific =
          'Express middleware uses next() to pass control to the next middleware function.';
      }
    } else if (generatedCode.framework === 'flask') {
      if (selectedFile.includes('routes')) {
        frameworkSpecific = 'Flask routes use @app.route() decorators to define endpoints.';
      }
    } else if (generatedCode.framework === 'django') {
      if (selectedFile.includes('views')) {
        frameworkSpecific = 'Django views handle request processing and return responses.';
      } else if (selectedFile.includes('urls')) {
        frameworkSpecific = 'Django URL patterns map URLs to view functions.';
      }
    }

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {fileName}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Path: {selectedFile}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {description}
        </Typography>

        <Typography variant="body2" paragraph color="text.secondary">
          {purpose}
        </Typography>

        {frameworkSpecific && (
          <Typography variant="body2" paragraph color="text.secondary">
            {frameworkSpecific}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => handleCopyFile(fileContent)}
            size="small"
          >
            Copy Content
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          <Typography
            component="pre"
            sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}
          >
            {typeof fileContent === 'object' ? JSON.stringify(fileContent, null, 2) : fileContent}
          </Typography>
        </Paper>
      </Box>
    );
  };

  if (!generatedCode) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography>No code has been generated yet.</Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Your{' '}
            {generatedCode.framework.charAt(0).toUpperCase() + generatedCode.framework.slice(1)} API
            is Ready!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={handleOpenSetupDialog}
              size="small"
            >
              Setup
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppIcon />}
              onClick={handleDownloadAll}
              size="small"
            >
              Download
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} aria-label="content tabs" sx={{ mb: 2 }}>
          <Tab icon={<FolderIcon />} label="Files" />
          <Tab icon={<InsertDriveFileIcon />} label="Details" />
          <Tab icon={<ChatIcon />} label="Chat" />
        </Tabs>

        {activeTab === 0 && (
          <Paper variant="outlined" sx={{ height: 'calc(100% - 220px)', overflow: 'auto' }}>
            <List>{renderFileTree(generatedCode.files)}</List>
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper variant="outlined" sx={{ height: 'calc(100vh - 220px)', overflow: 'auto' }}>
            {renderFileDetails()}
          </Paper>
        )}

        {activeTab === 2 && (
          <Box sx={{ height: 'calc(100vh - 220px)' }}>
            <ChatPanel generatedCode={generatedCode} postmanCollection={postmanCollection} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Your {generatedCode.framework.charAt(0).toUpperCase() + generatedCode.framework.slice(1)}{' '}
          API is Ready!
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<HelpOutlineIcon />}
            onClick={handleOpenSetupDialog}
          >
            Setup Instructions
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadAll}
          >
            Download ZIP
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '700px',
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Generated Files
              </Typography>
            </Box>
            <List
              sx={{
                overflow: 'auto',
                flexGrow: 1,
                position: 'relative',
                '& .MuiListItem-root': {
                  transition: 'background-color 0.2s',
                },
              }}
            >
              {renderFileTree(generatedCode.files)}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4, lg: 6 }}>
          <Paper variant="outlined" sx={{ height: '100%', maxHeight: '700px' }}>
            {renderFileDetails()}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <ChatPanel generatedCode={generatedCode} postmanCollection={postmanCollection} />
        </Grid>
      </Grid>

      <CustomDialog open={setupDialogOpen} onClose={handleCloseSetupDialog} maxWidth="md" fullWidth>
        <DialogTitle id="setup-dialog-title" sx={{ m: 0, p: 2, position: 'relative' }}>
          <Typography variant="h5">Setup Instructions</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseSetupDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>{renderSetupInstructions()}</DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadAll}
            startIcon={<GetAppIcon />}
          >
            Download ZIP
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default ResultStep;
