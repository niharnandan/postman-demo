// Before running please add your CLAUDE_API_KEY!

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const CLAUDE_API_KEY = 'CLAUDE_API_KEY_HERE';
const app = express();
const PORT = process.env.PORT || 3005;

console.log(`Server starting up with timestamp: ${new Date().toISOString()}`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/generate-code', async (req, res) => {
  console.log('🚀 Request received to /api/generate-code');
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2).substring(0, 500) + '...');

    const { postmanCollection, framework, dbUrl, authKey, includeSetupFiles, customInstructions } =
      req.body;

    console.log('includeSetupFiles value:', includeSetupFiles);
    console.log('includeSetupFiles type:', typeof includeSetupFiles);
    console.log('includeSetupFiles === false:', includeSetupFiles === false);
    console.log('includeSetupFiles == false:', includeSetupFiles == false);
    console.log('Boolean(includeSetupFiles):', Boolean(includeSetupFiles));

    const shouldIncludeSetupFiles =
      typeof includeSetupFiles === 'string'
        ? includeSetupFiles.toLowerCase() === 'true'
        : Boolean(includeSetupFiles);

    console.log('Final shouldIncludeSetupFiles:', shouldIncludeSetupFiles);
    console.log('Custom Instructions:', customInstructions || 'None provided');

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({
        message: 'Claude API key is not configured on the server',
      });
    }

    let userContent = '';

    if (shouldIncludeSetupFiles === false) {
      console.log('NOT including setup files - adding special instructions');
      userContent = `
*********************************************************
*                 CRITICAL INSTRUCTION                   *
*********************************************************

YOU MUST NOT GENERATE ANY SETUP FILES. THIS IS NON-NEGOTIABLE.

The following files MUST NOT be included in your response:
- NO package.json
- NO README.md 
- NO .gitignore
- NO .env or .env.example
- NO Dockerfile
- NO docker-compose.yml
- NO LICENSE
- NO tsconfig.json
- NO package-lock.json
- NO jest.config.js
- NO .eslintrc
- NO .prettierrc
- NO configuration files of any kind
- NO setup instructions

ONLY generate core server implementation files:
- API route handlers 
- Controllers
- Models
- Middleware files
- Utility functions

I will verify your compliance with this requirement.

*********************************************************

`;
    } else {
      console.log('Including setup files - no special instructions needed');
    }

    userContent += `Generate API code based on the following Postman collection.
          
Framework: ${framework}
Database URL: ${dbUrl ? dbUrl : 'None (generate code without database connection)'}
Auth Key: ${authKey || 'None'}
Include Setup Files: ${shouldIncludeSetupFiles !== false ? 'Yes' : 'No'}

*********************************************************
*                CRITICAL REQUIREMENTS                   *
*********************************************************

1. CREATE SEPARATE FILES FOR EACH API REQUEST: Create a separate route file and controller file for EACH individual request in the Postman collection, even if some share the same path. Name each file based on the request name in the collection.

2. MAINTAIN FOLDER STRUCTURE: Organize all files into appropriate folders:
   - routes/: All route files (one per Postman request)
   - controllers/: All controller files (one per Postman request)
   - middleware/: Any middleware needed
   - services/: Any service layers needed
   - any other util, errorHandler, etc. folders if required

3. NO ROUTE PARAMETERS: Do NOT use route parameters or path variables like ":id" or ":userId". Instead, use fixed, hardcoded routes that exactly match the examples in the Postman collection.

4. SIMPLIFY FUNCTION PARAMETERS: Do not pass parameters to functions like "projectId", "databaseId", etc. Instead, hardcode these values directly in the function implementation.

5. KEEP IMPLEMENTATION SIMPLE: Each route should directly implement its functionality without complex abstractions.

6. MATCH POSTMAN EXACTLY: The API paths, query parameters, and request bodies should exactly match what's in the Postman collection.

7. FOR EXAMPLE: If the Postman collection has a GET request to "https://firestore.googleapis.com/v1/projects/postman-9447c/databases/(default)/documents/users", then create a file named "getFireStoreRoutes.js" with a route that exactly matches this path, and a corresponding controller file.

8. PROPERLY ENCODE URLs: Ensure all special characters in URLs are properly URL-encoded in ALL contexts, including both API calls AND route definitions. For example:
   - '(' should be encoded as '%28'
   - ')' should be encoded as '%29'
   - Spaces should be encoded as '%20'
   - All other special characters should be properly encoded using encodeURIComponent()

   This requirement applies to:
   - URLs in controller files when making API requests
   - Path strings in router files when defining routes
   - ANY other place where URLs appear in the code

   WRONG IN CONTROLLERS:  https://firestore.googleapis.com/v1/projects/postman-9447c/databases/(default)/documents/users
   RIGHT IN CONTROLLERS:  https://firestore.googleapis.com/v1/projects/postman-9447c/databases/%28default%29/documents/users

   WRONG IN ROUTES:  router.get('/v1/projects/postman-9447c/databases/(default)/documents/users', ...)
   RIGHT IN ROUTES:  router.get('/v1/projects/postman-9447c/databases/%28default%29/documents/users', ...)   
   WRONG:  https://firestore.googleapis.com/v1/projects/postman-9447c/databases/(default)/documents/users
   RIGHT:  https://firestore.googleapis.com/v1/projects/postman-9447c/databases/%28default%29/documents/users

9. INCLUDE ALL REQUEST BODIES AND HEADERS: For each request in the Postman collection, include:
   - All request headers (e.g., Content-Type) exactly as specified in the collection
   - All request bodies (for POST, PUT, PATCH methods) exactly as specified in the collection
   - Use the exact same structure for request bodies and headers in the controller implementation
   - Do not omit any headers or body properties from the original Postman request
   - If a Postman request has a body, make sure to include it in your implementation

*********************************************************`;

    if (customInstructions && customInstructions.trim() !== '') {
      userContent += `

*********************************************************
*              USER PRIORITY INSTRUCTIONS               *
*********************************************************

IMPORTANT: The following custom instructions from the user TAKE PRIORITY over any 
conflicting requirements stated above or in the system instructions. If there is 
any contradiction between these user instructions and previous requirements, 
THESE USER INSTRUCTIONS MUST BE FOLLOWED.

${customInstructions}

*********************************************************`;
    }

    userContent += `

The code should include ${shouldIncludeSetupFiles !== false ? 'all' : 'only core'} files needed to run a complete API server.
${dbUrl ? 'Set up the database connection using the provided URL and authentication key.' : 'Since no database URL was provided, generate code that can work without a database connection or use in-memory storage as a fallback.'}

Here's the Postman collection:
${JSON.stringify(postmanCollection.content, null, 2)}`;

    if (shouldIncludeSetupFiles === false) {
      userContent += `

*********************************************************
FINAL REMINDER: DO NOT INCLUDE ANY SETUP FILES LIKE package.json, .gitignore, README.md, etc.
*********************************************************
`;
    }

    userContent += `

Please respond with a JSON object that has the following structure:
{
  "framework": "${framework}",
  "files": {
    "path/to/file1.js": "content of file1",
    "path/to/file2.js": "content of file2",
    ...
  },
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/resource",
      "description": "Description of endpoint"
    },
    ...
  ],
  "setupInstructions": {
    "experienceLevel": "beginner",
    "steps": [
      {
        "title": "Step 1: Setup Environment",
        "instructions": "Instructions for setting up the environment..."
      },
      {
        "title": "Step 2: Install Dependencies",
        "instructions": "Instructions for installing dependencies..."
      }
    ]
  }
}`;

    const systemPrompt = `You are an API code generator that specializes in creating server code from Postman collections.
Your task is to analyze the Postman collection and generate a complete API server implementation based on the specified framework.
${shouldIncludeSetupFiles === false ? 'CRITICAL: You MUST NOT generate ANY project setup files such as package.json, README.md, .gitignore, etc. You must ONLY generate the core server implementation files required to implement the API endpoints.' : ''}

CRITICAL IMPLEMENTATION REQUIREMENTS:
1. Create a separate route file and controller file for EACH individual request in the Postman collection, even if they share the same base path
2. Do NOT use route parameters (like :id, :userId) - use fixed, hardcoded routes exactly matching the Postman collection
3. Hardcode values like project IDs, database IDs directly in the function implementations rather than passing them as parameters
4. Keep the implementation simple with direct API calls that match the Postman collection exactly
5. Don't try to abstract or generalize the routes - each route should be independent
6. Include ALL request headers and request bodies exactly as specified in the Postman collection - do not omit any headers or request body properties

SETUP INSTRUCTIONS REQUIREMENTS:
1. ${shouldIncludeSetupFiles !== false ? 'Provide comprehensive, step-by-step instructions for setting up the project from scratch, including environment setup, dependency installation, and configuration' : 'Provide minimal instructions assuming the user already has a basic server setup'}
2. Instructions should be tailored to the selected framework (${framework})
3. If database details were provided, include specific steps for database configuration
4. Set the experienceLevel to "${shouldIncludeSetupFiles !== false ? 'beginner' : 'experienced'}" based on whether the user needs complete setup instructions
5. Each step should have a clear title and ${shouldIncludeSetupFiles !== false ? 'comprehensive' : 'concise'} instructions

${
  customInstructions && customInstructions.trim() !== ''
    ? `USER PRIORITY INSTRUCTIONS:
${customInstructions}

IMPORTANT: These user instructions OVERRIDE any conflicting requirements listed above. If the user's instructions contradict any of the default requirements, YOU MUST PRIORITIZE THE USER'S INSTRUCTIONS. The user's custom instructions represent their specific needs and should be given precedence over general guidelines.`
    : ''
}

Always respond with valid, well-structured code that follows best practices for the given framework.
Ensure your response is a valid JSON object with the specified structure.`;

    console.log('Making request to Claude API');
    console.log('Include setup files (final):', shouldIncludeSetupFiles);

    console.log('Sending request to Claude API...');
    const claudeResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 25000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userContent,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        timeout: 60000,
      },
    );

    console.log('Claude API response received:', claudeResponse.status);

    const content = claudeResponse.data.content[0].text;

    try {
      console.log('Parsing Claude response...');
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const generatedCode = JSON.parse(jsonStr);

        console.log('Generated code parsed successfully');
        console.log('Number of files before filtering:', Object.keys(generatedCode.files).length);

        if (shouldIncludeSetupFiles === false) {
          console.log('Filtering out setup files...');
          const setupFileKeywords = [
            'package.json',
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
            'readme',
            'README',
            'license',
            'LICENSE',
            '.gitignore',
            '.dockerignore',
            '.env',
            '.eslintrc',
            '.prettierrc',
            'tsconfig',
            'jest.config',
            'babel.config',
            'webpack.config',
            'docker',
            'Dockerfile',
            'docker-compose',
            'nodemon',
            'setup',
            'install',
            'config.js',
            'config.json',
            'configuration',
          ];

          const filteredFiles = Object.fromEntries(
            Object.entries(generatedCode.files).filter(([path, _]) => {
              const lowerPath = path.toLowerCase();
              const shouldKeep = !setupFileKeywords.some(
                (keyword) =>
                  lowerPath.includes(keyword.toLowerCase()) ||
                  path.match(new RegExp(`^${keyword}$`, 'i')),
              );

              if (!shouldKeep) {
                console.log('Filtering out file:', path);
              }

              return shouldKeep;
            }),
          );

          generatedCode.files = filteredFiles;

          console.log(
            `Filtered out setup files. Before: ${Object.keys(generatedCode.files).length} files. After: ${Object.keys(filteredFiles).length} files.`,
          );
          console.log('Remaining files:', Object.keys(filteredFiles));
        }

        console.log('Sending response back to client');
        return res.json(generatedCode);
      } else {
        throw new Error('Could not extract valid JSON from Claude response');
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      return res.status(500).json({
        message: 'Failed to parse code generation response. Please try again.',
      });
    }
  } catch (error) {
    console.error('Error generating code:', error);

    if (error.response) {
      console.error('Response error details:', {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return res.status(500).json({
      message: error.response?.data?.error?.message || 'Failed to generate code. Please try again.',
    });
  }
});

app.post('/api/chat', async (req, res) => {
  console.log('🚀 Request received to /api/chat');
  try {
    const { message, generatedCode, postmanCollection } = req.body;

    if (!message) {
      return res.status(400).json({
        message: 'Message is required',
      });
    }

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({
        message: 'Claude API key is not configured on the server',
      });
    }

    const codeContext = {
      framework: generatedCode.framework,
      endpoints: generatedCode.endpoints,
      fileList: Object.keys(generatedCode.files),
    };

    const fileMatch = message.match(
      /file|code|function|route|controller|model|middleware|service|utility|helper|utils|index|app|server/i,
    );
    let relevantFiles = {};

    if (fileMatch) {
      const keywords = message.toLowerCase().split(/\s+/);

      Object.entries(generatedCode.files).forEach(([path, content]) => {
        const lowerPath = path.toLowerCase();

        if (keywords.some((keyword) => keyword.length > 3 && lowerPath.includes(keyword))) {
          relevantFiles[path] = content;
        }
      });

      if (Object.keys(relevantFiles).length === 0 || Object.keys(relevantFiles).length > 3) {
        const mainFile = Object.keys(generatedCode.files).find(
          (path) => path.includes('app.') || path.includes('index.') || path.includes('server.'),
        );

        if (mainFile) {
          relevantFiles[mainFile] = generatedCode.files[mainFile];
        }

        const routeFile = Object.keys(generatedCode.files).find(
          (path) => path.includes('/routes/') || path.includes('Route'),
        );

        if (routeFile) {
          relevantFiles[routeFile] = generatedCode.files[routeFile];
        }
      }
    }

    codeContext.relevantFiles = relevantFiles;

    const systemPrompt = `You are an API documentation assistant helping a user understand the code you've generated from their Postman collection.
You have full knowledge of the API code that was generated, which was a ${generatedCode.framework} implementation.

When answering questions:
1. Be concise and direct, focusing on the specific question.
2. Reference the specific code files when explaining functionality.
3. If asked about a specific file, explain its purpose and how it relates to the overall API.
4. Use code snippets to illustrate your explanations when helpful.
5. If asked about implementation details, explain the approach taken and why.
6. When explaining endpoints, include their HTTP method, path, and purpose.

You have access to the complete list of generated files. If asked about a file that's not in the provided relevant files,
mention that you'd need to examine that specific file to give details.`;

    const userPrompt = `I'm looking at the API code you generated for me based on my Postman collection. Here's my question:

${message}

Here's context about the API code:
- Framework: ${generatedCode.framework}
- Number of files: ${Object.keys(generatedCode.files).length}
- Number of endpoints: ${generatedCode.endpoints.length}

${
  Object.keys(relevantFiles).length > 0
    ? `Here are the relevant file(s) you might be asking about:
${Object.entries(relevantFiles)
  .map(
    ([path, content]) =>
      `File: ${path}\n\`\`\`\n${typeof content === 'object' ? JSON.stringify(content, null, 2) : content}\n\`\`\``,
  )
  .join('\n\n')}`
    : ''
}`;

    console.log('Sending request to Claude API for chat...');
    const claudeResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      },
    );

    console.log('Claude API chat response received');
    const responseText = claudeResponse.data.content[0].text;

    return res.json({
      response: responseText,
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);

    if (error.response) {
      console.error('Response error details:', {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return res.status(500).json({
      message: 'Failed to process chat message. Please try again.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});