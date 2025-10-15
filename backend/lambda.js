const serverlessExpress = require('@vendia/serverless-express');
const app = require('./server');

// Set environment variable to disable callback warning
process.env.AWS_LAMBDA_NODEJS_DISABLE_CALLBACK_WARNING = 'true';

// Create the serverless express handler with better error handling
const handler = serverlessExpress({ 
  app,
  // Add event source detection for better compatibility
  eventSourceRoutes: {
    'aws:apigateway': '/{proxy+}',
    'aws:alb': '/{proxy+}'
  }
});

// Wrapper to handle different event types
const lambdaHandler = async (event, context) => {
  // Handle direct Lambda function invocations for testing
  if (!event.httpMethod && !event.requestContext) {
    console.log('Direct Lambda invocation detected, creating synthetic HTTP event');
    
    // Create a synthetic API Gateway event for testing
    const syntheticEvent = {
      httpMethod: 'GET',
      path: '/health',
      pathParameters: null,
      queryStringParameters: null,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: null,
      isBase64Encoded: false,
      requestContext: {
        accountId: 'test',
        apiId: 'test',
        httpMethod: 'GET',
        path: '/health',
        stage: 'test',
        requestId: 'test-request-id'
      }
    };
    
    return handler(syntheticEvent, context);
  }
  
  // Handle normal API Gateway/ALB events
  return handler(event, context);
};

module.exports = { handler: lambdaHandler };
