import axios, { type AxiosResponse } from 'axios';

interface PostmanCollection {
  name: string;
  content: any;
}

interface GenerationRequestData {
  postmanCollection: PostmanCollection;
  framework: string;
  dbUrl: string;
  authKey?: string;
  includeSetupFiles?: boolean;
  customInstructions?: string;
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
  setupInstructions: SetupInstructions;
}

export const generateCode = async (data: GenerationRequestData): Promise<GeneratedCode> => {
  try {
    const API_ENDPOINT = 'http://localhost:3005/api/generate-code';

    console.log('Sending request to backend server:', {
      framework: data.framework,
      dbUrl: data.dbUrl ? 'Provided' : 'None',
      authKey: data.authKey ? 'Provided' : 'None',
      includeSetupFiles: data.includeSetupFiles,
      customInstructions: data.customInstructions ? 'Provided' : 'None',
    });

    const response: AxiosResponse = await axios.post(
      API_ENDPOINT,
      {
        postmanCollection: data.postmanCollection,
        framework: data.framework,
        dbUrl: data.dbUrl,
        authKey: data.authKey,
        includeSetupFiles: data.includeSetupFiles,
        customInstructions: data.customInstructions,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      },
    );

    return response.data as GeneratedCode;
  } catch (error: any) {
    console.error('Error generating code:', error);

    if (error.response) {
      console.error('Response error details:', {
        status: error.response.status,
        data: error.response.data,
      });
    }

    throw new Error(error.response?.data?.message || 'Failed to generate code. Please try again.');
  }
};
