const serverless = require('serverless-http');
const app = require('./server');

// AWS Lambda handler
module.exports.handler = serverless(app);