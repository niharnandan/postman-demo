import { useState } from 'react';
import { Box, Typography, Paper, Button, ListItemText, ListItemIcon } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';

interface PostmanCollection {
  name: string;
  content: Record<string, any>;
}

interface UploadStepProps {
  onFileUpload: (file: PostmanCollection | null) => void;
  file: PostmanCollection | null;
  onNext?: () => void;
  isNextDisabled?: boolean;
}

const UploadStep = ({ onFileUpload, file, onNext, isNextDisabled }: UploadStepProps) => {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File): void => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>): void => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const json = JSON.parse(result);
          onFileUpload({
            name: file.name,
            content: json,
          });
        } else {
          throw new Error('File could not be read as text');
        }
      } catch (e) {
        alert('Invalid JSON file. Please upload a valid Postman collection.');
      }
    };

    reader.readAsText(file);
  };

  const removeFile = (): void => {
    onFileUpload(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Upload your Postman collection
      </Typography>

      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Upload a Postman collection JSON file that contains your API specifications. The app will
        parse this collection to generate server code.
      </Typography>

      {!file ? (
        <Paper
          variant="outlined"
          component="label"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            width: '100%',
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: dragActive ? 'primary.main' : 'divider',
            backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          <input
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <UploadFileIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography>
            Drag and drop your Postman collection file here, or click to browse
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              flexGrow: 1,
              p: 2,
              borderRadius: 1,
              mr: onNext ? 2 : 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary={file.name} />
              <Button startIcon={<DeleteIcon />} color="error" onClick={removeFile} size="small">
                Remove
              </Button>
            </Box>
          </Paper>

          {onNext && (
            <Button
              onClick={onNext}
              variant="contained"
              color="primary"
              disabled={isNextDisabled}
              sx={{ height: 40 }}
            >
              Next
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UploadStep;
