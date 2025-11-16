# Vercel Deployment Guide - CORS Fix

## Problem
The backend deployed on Vercel was experiencing CORS errors because:
1. Vercel serverless functions don't execute the standard NestJS bootstrap code in `main.ts`
2. OPTIONS preflight requests weren't being handled properly
3. CORS headers weren't being set at the Vercel infrastructure level

## Solution Implemented

### 1. Created `api/index.ts` - Vercel Serverless Function Handler
This file creates a NestJS application wrapped in a Vercel-compatible serverless function that:
- Handles OPTIONS preflight requests immediately
- Configures CORS properly for serverless environment
- Caches the NestJS server instance for better performance
- Maintains all your existing middleware and configuration

### 2. Created `vercel.json` - Vercel Configuration
This configuration:
- Routes all requests through the serverless function
- Adds CORS headers at the Vercel infrastructure level
- Ensures proper handling of all HTTP methods

### 3. Added `api/tsconfig.json`
TypeScript configuration for the API directory to ensure proper compilation.

## Deployment Steps

1. **Commit the new files:**
   ```bash
   cd /Users/zamteldeveloper/Documents/Personal\ Projects/plutex-backend
   git add api/ vercel.json
   git commit -m "Add Vercel serverless function configuration to fix CORS"
   git push
   ```

2. **Redeploy on Vercel:**
   - The deployment should happen automatically if you have auto-deploy enabled
   - Or manually trigger a deployment from the Vercel dashboard

3. **Verify the deployment:**
   - Check that the build succeeds
   - Test the API endpoint: `https://plutex-backend.vercel.app/api/auth/login`
   - Verify CORS headers are present in the response

## Important Notes

### Environment Variables
Make sure these environment variables are set in your Vercel project:
- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to "production"
- Any other environment variables your app needs

### Multiple Origins (Optional)
If you need to support multiple origins (e.g., admin.plutex.co.zm), update the `vercel.json` headers section:

```json
{
  "key": "Access-Control-Allow-Origin",
  "value": "https://www.plutex.co.zm, https://admin.plutex.co.zm"
}
```

Or use a wildcard pattern in the `api/index.ts` file's CORS configuration.

### Testing CORS
You can test CORS headers using curl:

```bash
# Test OPTIONS preflight
curl -X OPTIONS https://plutex-backend.vercel.app/api/auth/login \
  -H "Origin: https://www.plutex.co.zm" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test actual POST request
curl -X POST https://plutex-backend.vercel.app/api/auth/login \
  -H "Origin: https://www.plutex.co.zm" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -v
```

Look for these headers in the response:
- `Access-Control-Allow-Origin: https://www.plutex.co.zm`
- `Access-Control-Allow-Methods: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Credentials: true`

## Troubleshooting

### If CORS still doesn't work:
1. Check Vercel build logs for any errors
2. Verify environment variables are set correctly
3. Check that the `api/index.ts` file is being used (look in Vercel function logs)
4. Ensure your frontend is using the correct API URL: `https://plutex-backend.vercel.app/api`

### If build fails:
1. Make sure all dependencies are in `package.json`
2. Check that TypeScript compiles without errors locally: `npm run build`
3. Review Vercel build logs for specific error messages
