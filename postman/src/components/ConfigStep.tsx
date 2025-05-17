import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  type SelectChangeEvent,
} from '@mui/material';

interface ConfigStepProps {
  framework: string;
  setFramework: (framework: string) => void;
  dbUrl: string;
  setDbUrl: (url: string) => void;
  authKey: string;
  setAuthKey: (key: string) => void;
  includeSetupFiles: boolean;
  setIncludeSetupFiles: (include: boolean) => void;
  customInstructions: string;
  setCustomInstructions: (instructions: string) => void;
}

const ConfigStep = ({
  framework,
  setFramework,
  dbUrl,
  setDbUrl,
  authKey,
  setAuthKey,
  includeSetupFiles,
  setIncludeSetupFiles,
  customInstructions,
  setCustomInstructions,
}: ConfigStepProps) => {
  const handleFrameworkChange = (e: SelectChangeEvent<string>): void => {
    setFramework(e.target.value);
  };

  const handleDbUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDbUrl(e.target.value);
  };

  const handleAuthKeyChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAuthKey(e.target.value);
  };

  const handleIncludeSetupFilesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIncludeSetupFiles(e.target.checked);
  };

  const handleCustomInstructionsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCustomInstructions(e.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Your API Generation
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Choose a server framework and provide optional database connection details.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Server Framework
            </Typography>

            <Box sx={{ mt: 2, width: 300, position: 'relative' }}>
              <FormControl variant="outlined" sx={{ width: '100%' }}>
                <InputLabel id="framework-select-label">Framework</InputLabel>
                <Select
                  labelId="framework-select-label"
                  id="framework-select"
                  value={framework}
                  onChange={handleFrameworkChange}
                  label="Framework"
                  sx={{
                    cursor: 'pointer',
                    '& .MuiSelect-select': {
                      cursor: 'pointer',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 300,
                        maxWidth: 300,
                      },
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    container: document.body,
                    transitionDuration: 0,
                    keepMounted: true,
                    disablePortal: true,
                    disableScrollLock: true,
                    disableAutoFocus: true,
                    disableEnforceFocus: true,
                    disableRestoreFocus: true,
                  }}
                >
                  <MenuItem value="express">Express.js (Node.js)</MenuItem>
                  <MenuItem value="flask">Flask (Python)</MenuItem>
                  <MenuItem value="django">Django (Python)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {framework === 'express' &&
                  'Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.'}
                {framework === 'flask' &&
                  'Flask is a lightweight WSGI web application framework in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.'}
                {framework === 'django' &&
                  'Django is a high-level Python Web framework that encourages rapid development and clean, pragmatic design.'}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSetupFiles}
                    onChange={handleIncludeSetupFilesChange}
                    color="primary"
                  />
                }
                label="Include setup files (package.json, .gitignore, README, etc.)"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                {includeSetupFiles
                  ? 'Will generate all necessary setup and configuration files.'
                  : 'Will only generate server code files without project setup files.'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Database Configuration (Optional)
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              id="dbUrl"
              label="Database Connection URL (Optional)"
              name="dbUrl"
              value={dbUrl}
              onChange={handleDbUrlChange}
              placeholder={
                framework === 'express'
                  ? 'mongodb+srv://username:password@cluster.mongodb.net/dbname'
                  : 'postgresql://username:password@hostname/dbname'
              }
              helperText={
                framework === 'express'
                  ? 'Optional Database connection string (e.g. mongodb+srv://...)'
                  : 'Optional PostgreSQL connection string (e.g. postgresql://...)'
              }
            />

            <TextField
              margin="normal"
              fullWidth
              id="authKey"
              label="Database Auth Key (Optional)"
              name="authKey"
              value={authKey}
              onChange={handleAuthKeyChange}
              placeholder="Your database authentication key if required"
              helperText="Leave blank if not required"
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mt: 3,
          width: '100%',
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Custom Instructions (Optional)
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Provide specific instructions to the AI for customizing your API code generation.
        </Typography>

        <TextField
          fullWidth
          id="customInstructions"
          label="Additional Instructions for AI"
          name="customInstructions"
          value={customInstructions}
          onChange={handleCustomInstructionsChange}
          multiline
          rows={4}
          placeholder="E.g., 'Add detailed comments to all functions', 'Implement rate limiting middleware', 'Use async/await instead of promises', etc."
          helperText="Enter any specific requirements or preferences for your generated API code"
        />
      </Paper>
    </Box>
  );
};

export default ConfigStep;
