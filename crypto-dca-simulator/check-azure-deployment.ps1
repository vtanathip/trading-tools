# Quick Azure Deployment Check Script
# Run this to diagnose what's "missing"
# .\check-azure-deployment.ps1 -StorageAccountName "tradingdevappmd1z" -ResourceGroup "rg-trading-tools-dev"

param(
    [Parameter(Mandatory = $true)]
    [string]$StorageAccountName,
    
    [string]$ResourceGroup = "rg-crypto-dca-simulator"
)

Write-Host "[INFO] Checking Azure deployment for: $StorageAccountName" -ForegroundColor Cyan
Write-Host ""

# 1. Check if storage account exists
Write-Host "[1] Checking storage account..." -ForegroundColor Yellow
$accountJson = az storage account show --name $StorageAccountName --resource-group $ResourceGroup 2>$null
if ($LASTEXITCODE -eq 0 -and $accountJson) {
    $account = $accountJson | ConvertFrom-Json
    Write-Host "   [OK] Storage account exists" -ForegroundColor Green
    Write-Host "   Location: $($account.location)" -ForegroundColor White
    Write-Host "   Public access: $($account.allowBlobPublicAccess)" -ForegroundColor White
}
else {
    Write-Host "   [ERROR] Storage account NOT found!" -ForegroundColor Red
    Write-Host "   TIP: You may need to create it first or check the name" -ForegroundColor Yellow
    exit 1
}

# 2. Get website URL
Write-Host ""
Write-Host "[2] Getting website URL..." -ForegroundColor Yellow
$websiteUrl = az storage account show --name $StorageAccountName --resource-group $ResourceGroup --query "primaryEndpoints.web" --output tsv
if ($websiteUrl) {
    Write-Host "   [OK] Website URL: $websiteUrl" -ForegroundColor Green
}
else {
    Write-Host "   [ERROR] No website URL found. Static website may not be enabled!" -ForegroundColor Red
}

# 3. Check if static website is enabled
Write-Host ""
Write-Host "[3] Checking static website configuration..." -ForegroundColor Yellow
$staticWebsiteJson = az storage blob service-properties show --account-name $StorageAccountName --query 'staticWebsite' 2>$null
if ($LASTEXITCODE -eq 0 -and $staticWebsiteJson) {
    $staticWebsite = $staticWebsiteJson | ConvertFrom-Json
    if ($staticWebsite.enabled) {
        Write-Host "   [OK] Static website is enabled" -ForegroundColor Green
        Write-Host "   Index document: $($staticWebsite.indexDocument)" -ForegroundColor White
        Write-Host "   Error document: $($staticWebsite.errorDocument404Path)" -ForegroundColor White
    }
    else {
        Write-Host "   [ERROR] Static website is NOT enabled!" -ForegroundColor Red
        Write-Host "   TIP: Run this command to enable it:" -ForegroundColor Yellow
        Write-Host "   az storage blob service-properties update --account-name $StorageAccountName --static-website --index-document index.html --404-document index.html" -ForegroundColor Gray
    }
}
else {
    Write-Host "   [WARNING] Could not check static website status" -ForegroundColor Yellow
}

# 4. List files in $web container
Write-Host ""
Write-Host "[4] Checking uploaded files in web container..." -ForegroundColor Yellow
$filesJson = az storage blob list --account-name $StorageAccountName --container-name '$web' --output json 2>$null
if ($LASTEXITCODE -eq 0 -and $filesJson) {
    $files = $filesJson | ConvertFrom-Json
    if ($files -and $files.Count -gt 0) {
        Write-Host "   [OK] Found $($files.Count) file(s)" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Files in web container:" -ForegroundColor Cyan
        foreach ($file in $files | Select-Object -First 10) {
            $sizeKB = [math]::Round($file.properties.contentLength / 1024, 2)
            Write-Host "      - $($file.name) ($sizeKB KB)" -ForegroundColor White
        }
        if ($files.Count -gt 10) {
            $remaining = $files.Count - 10
            Write-Host "      (and $remaining more files...)" -ForegroundColor Gray
        }
        
        # Check for critical files
        $hasIndexHtml = $files | Where-Object { $_.name -eq "index.html" }
        $hasAssets = $files | Where-Object { $_.name -like "assets/*" }
        
        Write-Host ""
        if ($hasIndexHtml) {
            Write-Host "   [OK] index.html found" -ForegroundColor Green
        }
        else {
            Write-Host "   [ERROR] index.html NOT found!" -ForegroundColor Red
        }
        
        if ($hasAssets) {
            Write-Host "   [OK] assets/ folder found with files" -ForegroundColor Green
        }
        else {
            Write-Host "   [WARNING] No files in assets/ folder" -ForegroundColor Yellow
        }
        
    }
    else {
        Write-Host "   [ERROR] NO FILES found in web container!" -ForegroundColor Red
        Write-Host "   TIP: You need to upload your build files" -ForegroundColor Yellow
    }
}
else {
    Write-Host "   [ERROR] Could not list files in web container" -ForegroundColor Red
    Write-Host "   This might mean the container doesn't exist or you don't have access" -ForegroundColor Yellow
}

# 5. Test website accessibility
Write-Host ""
Write-Host "[5] Testing website accessibility..." -ForegroundColor Yellow
if ($websiteUrl) {
    try {
        $response = Invoke-WebRequest -Uri $websiteUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   [OK] Website is accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
    }
    catch {
        Write-Host "   [ERROR] Website is NOT accessible!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Storage Account: $StorageAccountName" -ForegroundColor White
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "Website URL: $websiteUrl" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit $websiteUrl in your browser" -ForegroundColor White
Write-Host "2. Press F12 to open Developer Tools" -ForegroundColor White
Write-Host "3. Check Console tab for any errors (especially CORS errors)" -ForegroundColor White
Write-Host "4. If you see CORS errors, see TROUBLESHOOTING_AZURE.md" -ForegroundColor White
Write-Host ""
