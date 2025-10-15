# Frontend Environment Configuration Guide

## Overview
Your frontend uses environment variables to determine which backend API to connect to. Here's how to configure it for different environments:

## Environment Files

### Development (.env.development)
- Used when running `npm start` locally
- API URL: `http://localhost:4000`
- Automatically selected when NODE_ENV=development

### Production (.env.production) 
- Used when building for production (`npm run build`)
- API URL: Should point to your deployed Lambda function
- Automatically selected when NODE_ENV=production

## Deployment URLs by Environment

### Development Environment
**Backend URL**: `http://localhost:4000`
**Frontend URL**: `http://localhost:3000`
**Usage**: Local development only

### Production Environment 
**Backend URL**: `https://your-lambda-function-url.amazonaws.com`
**Frontend URL**: `https://produdupiyaroperations-7gk8zx0uw-prathvirajs-projects-9572aadb.vercel.app`

## AWS Lambda Function URL Setup

When you deploy your Lambda function, you can get a Function URL:

1. Go to AWS Lambda Console
2. Select your function: `udupiyar-operations-dev` (or create production version)
3. Go to Configuration > Function URL
4. Create Function URL with:
   - **Auth type**: NONE (for public API)
   - **CORS**: Enabled
   - **Origin**: Your Vercel domain
   - **Methods**: GET, POST, PUT, DELETE, OPTIONS
   - **Headers**: Content-Type, Authorization

## Vercel Environment Variables

In your Vercel dashboard, set these environment variables:

### For Preview/Development Deployments:
- `REACT_APP_API_URL` = `https://your-dev-lambda-url.amazonaws.com`
- `REACT_APP_ENVIRONMENT` = `development`

### For Production Deployments:
- `REACT_APP_API_URL` = `https://your-prod-lambda-url.amazonaws.com` 
- `REACT_APP_ENVIRONMENT` = `production`

## Alternative Backend Deployment Options

### Option 1: AWS Lambda Function URLs (Recommended)
- Direct HTTP(S) endpoint for Lambda
- Automatic scaling
- Built-in CORS support
- URL format: `https://{function-url-id}.lambda-url.{region}.on.aws/`

### Option 2: API Gateway + Lambda
- More features (rate limiting, API keys, etc.)
- Custom domain support
- URL format: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}`

### Option 3: Different Lambda Functions for Each Environment
- `udupiyar-operations-dev` → Development database
- `udupiyar-operations-prod` → Production database
- Each with separate Function URLs

## Current CORS Configuration

Your backend now supports these origins:
- ✅ `localhost:3000` (local development)
- ✅ `*.vercel.app` (all Vercel deployments)
- ✅ `*.ngrok-free.dev` (ngrok tunnels)
- ✅ Your specific Vercel URL

## Next Steps

1. **Deploy Updated Backend**: Upload the new Lambda package with CORS fixes
2. **Get Lambda Function URL**: Create Function URL in AWS Console
3. **Update Frontend Environment**: Set `REACT_APP_API_URL` in Vercel
4. **Test Connection**: Verify frontend can reach backend API
5. **Set up Production Environment**: Create separate prod Lambda if needed

## Example Vercel Environment Setup

```bash
# In Vercel Dashboard > Project > Settings > Environment Variables

# For Preview Deployments:
REACT_APP_API_URL = https://abc123.lambda-url.us-east-1.on.aws
REACT_APP_ENVIRONMENT = development

# For Production Deployments:  
REACT_APP_API_URL = https://xyz789.lambda-url.us-east-1.on.aws
REACT_APP_ENVIRONMENT = production
```