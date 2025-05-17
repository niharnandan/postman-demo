import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
} from '@mui/material';
import UploadStep from './components/UploadStep';
import ConfigStep from './components/ConfigStep';
import ResultStep from './components/ResultStep';
import Header from './components/Header';
import { generateCode } from './services/apiService';
import ApiVisualizer from './components/ApiVisualizer';
import { ReactFlowProvider } from 'reactflow';

interface PostmanCollection {
  name: string;
  content: Record<string, any>;
}

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

const steps = ['Upload Postman Collection', 'Configure Settings', 'Download Generated Code'];

function App() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [postmanCollection, setPostmanCollection] = useState<PostmanCollection | null>(null);
  const [framework, setFramework] = useState<string>('express');
  const [dbUrl, setDbUrl] = useState<string>('');
  const [authKey, setAuthKey] = useState<string>('');
  const [includeSetupFiles, setIncludeSetupFiles] = useState<boolean>(true);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async (): Promise<void> => {
    if (activeStep === 1) {
      setIsLoading(true);
      setError(null);

      try {
        if (!postmanCollection) {
          throw new Error('Postman collection is required');
        }

        const result = await generateCode({
          postmanCollection,
          framework,
          dbUrl,
          authKey,
          includeSetupFiles,
          customInstructions,
        });

        setGeneratedCode(result);
        setActiveStep((prevStep) => prevStep + 1);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'An error occurred while generating code');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = (): void => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = (): void => {
    setActiveStep(0);
    setPostmanCollection(null);
    setFramework('express');
    setDbUrl('');
    setAuthKey('');
    setIncludeSetupFiles(true);
    setCustomInstructions('');
    setGeneratedCode(null);
    setError(null);
  };

  const getStepContent = (step: number): React.ReactNode => {
    switch (step) {
      case 0:
        return (
          <UploadStep
            onFileUpload={setPostmanCollection}
            file={postmanCollection}
            onNext={handleNext}
            isNextDisabled={!postmanCollection}
          />
        );
      case 1:
        return (
          <ConfigStep
            framework={framework}
            setFramework={setFramework}
            dbUrl={dbUrl}
            setDbUrl={setDbUrl}
            authKey={authKey}
            setAuthKey={setAuthKey}
            includeSetupFiles={includeSetupFiles}
            setIncludeSetupFiles={setIncludeSetupFiles}
            customInstructions={customInstructions}
            setCustomInstructions={setCustomInstructions}
          />
        );
      case 2:
        return <ResultStep generatedCode={generatedCode} postmanCollection={postmanCollection} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Header />
      <Box
        component="main"
        sx={{
          mt: -5,
          mb: 4,
          flex: 1,
          width: '100%',
          px: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            maxWidth: activeStep === 2 ? '1600px' : '1200px',
            mx: 'auto',
            width: '100%',
            transition: 'max-width 0.3s ease',
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Postman to API Code Generator
          </Typography>

          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Box sx={{ mb: 4 }}>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} variant="outlined" sx={{ mr: 1 }}>
                Back
              </Button>
            )}

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === steps.length - 1 ? (
              <Button onClick={handleReset} variant="contained" color="primary">
                Generate New Code
              </Button>
            ) : (
              activeStep !== 0 && (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : activeStep === steps.length - 2 ? (
                    'Generate Code'
                  ) : (
                    'Next'
                  )}
                </Button>
              )
            )}
          </Box>

          {activeStep === 0 && postmanCollection && (
            <Box sx={{ mt: -5, width: '100%' }}>
              <ReactFlowProvider>
                <ApiVisualizer postmanCollection={postmanCollection} />
              </ReactFlowProvider>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
