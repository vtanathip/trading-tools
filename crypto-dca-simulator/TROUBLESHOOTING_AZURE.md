# Azure Deployment Troubleshooting Guide

## Common Issues When Application Appears "Missing"

### 1. ⚠️ CoinGecko API CORS Issue (Most Common)

**Problem**: The application loads but fails to fetch crypto prices, showing errors in the browser console.

**Symptoms**:
- Website loads but shows "Failed to fetch prices" errors
- Browser console shows CORS errors like: `Access to fetch at 'https://api.coingecko.com' has been blocked by CORS policy`

**Why This Happens**: 
CoinGecko API requires an API key for CORS requests from browser-based applications deployed to production domains.

**Solution**:
You need to use a backend proxy or serverless function to call the CoinGecko API. Here are your options:

#### Option A: Azure Functions Proxy (Recommended)
1. Create an Azure Function to proxy API requests
2. Configure environment variables with your CoinGecko API key
3. Update `src/services/priceApi.ts` to call your Azure Function instead of CoinGecko directly

#### Option B: Use Demo Mode
Add a demo mode that uses mock data when API calls fail:

```typescript
// In priceApi.ts
const USE_DEMO_MODE = true; // Toggle this for demo deployments

export async function getHistoricalPrices(...) {
  if (USE_DEMO_MODE) {
    return generateMockHistoricalData(...);
  }
  // Real API call
}
```

#### Option C: Get CoinGecko API Key
1. Sign up at https://www.coingecko.com/en/api
2. Get an API key that allows CORS requests
3. Add the API key to your requests

---

### 2. 🔍 Files Not Uploaded Correctly

**Problem**: The website shows a blank page or 404 error.

**Check**:
```powershell
# List files in the $web container
az storage blob list --account-name YOUR_STORAGE_ACCOUNT --container-name '$web' --output table
```

**Solution**:
```powershell
# Re-run the deployment script
cd crypto-dca-simulator
.\deploy-azure.ps1 -StorageAccountName "your-account-name" -ResourceGroup "your-resource-group"
```

---

### 3. 🌐 Static Website Not Enabled

**Problem**: You get an error accessing the website URL.

**Check**:
```powershell
# Check if static website is enabled
az storage blob service-properties show --account-name YOUR_STORAGE_ACCOUNT --query 'staticWebsite'
```

**Solution**:
```powershell
# Enable static website hosting
az storage blob service-properties update `
    --account-name YOUR_STORAGE_ACCOUNT `
    --static-website `
    --index-document index.html `
    --404-document index.html
```

---

### 4. 📦 Build Files Missing

**Problem**: Deployment script fails with "Build directory not found".

**Solution**:
```powershell
# Build the application first
cd crypto-dca-simulator
npm install
npm run build

# Verify build directory exists
Get-ChildItem build
```

---

### 5. 🔒 Storage Account Access Issues

**Problem**: 403 Forbidden errors when accessing the website.

**Check**:
- Ensure "Allow Blob public access" is enabled on the storage account
- Verify the $web container has "Blob (anonymous read access for blobs only)" access level

**Solution**:
```powershell
# Update storage account to allow public access
az storage account update `
    --name YOUR_STORAGE_ACCOUNT `
    --resource-group YOUR_RESOURCE_GROUP `
    --allow-blob-public-access true

# Set container access level
az storage container set-permission `
    --name '$web' `
    --account-name YOUR_STORAGE_ACCOUNT `
    --public-access blob
```

---

## Quick Diagnostic Commands

### Get Your Website URL
```powershell
az storage account show `
    --name YOUR_STORAGE_ACCOUNT `
    --resource-group YOUR_RESOURCE_GROUP `
    --query "primaryEndpoints.web" `
    --output tsv
```

### Check Deployment Status
```powershell
# List all files in $web container
az storage blob list `
    --account-name YOUR_STORAGE_ACCOUNT `
    --container-name '$web' `
    --output table

# Check storage account properties
az storage account show `
    --name YOUR_STORAGE_ACCOUNT `
    --resource-group YOUR_RESOURCE_GROUP
```

### View Browser Console Errors
1. Open your website in a browser
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Look for errors (especially CORS errors)

---

## Complete Re-deployment Steps

If something went wrong, here's how to completely re-deploy:

```powershell
# 1. Navigate to project directory
cd e:\Development\repository\trading-tools\crypto-dca-simulator

# 2. Ensure dependencies are installed
npm install

# 3. Build the application
npm run build

# 4. Verify build was successful
Get-ChildItem build

# 5. Run deployment script
.\deploy-azure.ps1 `
    -StorageAccountName "your-unique-name" `
    -ResourceGroup "rg-crypto-dca-simulator" `
    -Location "eastus"

# 6. Get the website URL
$url = az storage account show `
    --name "your-unique-name" `
    --resource-group "rg-crypto-dca-simulator" `
    --query "primaryEndpoints.web" `
    --output tsv
Write-Host "Website URL: $url"
```

---

## Testing Locally Before Deployment

Always test the production build locally before deploying:

```powershell
# Build and preview
npm run build
npm run preview
```

This will start a local server with the production build at http://localhost:4173

---

## Important Notes

### CoinGecko API Limitations
- **Free tier**: 30 calls/minute
- **CORS**: Requires API key for browser requests from production domains
- **Localhost**: Works without API key (localhost is whitelisted)

### Cost Considerations
- Storage: ~$0.02/month for small static sites
- Bandwidth: First 5GB/month free, then ~$0.087/GB
- CDN (optional): Adds ~$0.081/GB for improved performance

---

## Next Steps After Successful Deployment

1. **Test the deployed application thoroughly**
2. **Set up a custom domain** (optional)
3. **Configure Azure CDN** for better performance (optional)
4. **Implement API proxy** to fix CORS issues with CoinGecko
5. **Set up CI/CD** with GitHub Actions for automated deployments

---

## Getting Help

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Run the diagnostic commands above
3. Verify your Azure CLI is logged in: `az account show`
4. Check Azure Portal for any deployment errors
