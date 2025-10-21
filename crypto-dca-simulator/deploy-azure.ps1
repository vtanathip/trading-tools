# Azure Blob Storage Deployment Script
param(
    [string]$StorageAccountName = "cryptodca$(Get-Date -Format 'yyyyMMddHHmm')",
    [string]$ResourceGroup = "rg-crypto-dca-simulator",
    [string]$Location = "eastus"
)

$ErrorActionPreference = "Stop"

Write-Host "[INFO] Starting deployment" -ForegroundColor Green
Write-Host "Storage: $StorageAccountName" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Cyan

# Check Azure CLI
try {
    $null = Get-Command az -ErrorAction Stop
} catch {
    Write-Host "[ERROR] Azure CLI not installed" -ForegroundColor Red
    exit 1
}

# Check login
try {
    $null = az account show 2>$null
    if ($LASTEXITCODE -ne 0) { throw }
} catch {
    Write-Host "[ERROR] Please run: az login" -ForegroundColor Red
    exit 1
}

# Create resource group
Write-Host "[1/6] Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output table

# Deploy ARM template
Write-Host "[2/6] Deploying storage account..." -ForegroundColor Yellow
az deployment group create --resource-group $ResourceGroup --template-file azure-deploy.json --parameters storageAccountName=$StorageAccountName --output table

# Enable static website
Write-Host "[3/6] Enabling static website..." -ForegroundColor Yellow
az storage blob service-properties update --account-name $StorageAccountName --static-website --index-document index.html --404-document index.html

# Build application
Write-Host "[4/6] Building application..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found" -ForegroundColor Red
    exit 1
}
npm run build

# Check build
if (-not (Test-Path "./build")) {
    Write-Host "[ERROR] Build directory not found" -ForegroundColor Red
    exit 1
}

# Upload files
Write-Host "[5/6] Uploading files..." -ForegroundColor Yellow
az storage blob upload-batch --account-name $StorageAccountName --destination '$web' --source ./build --pattern "*" --overwrite

# Get URL
Write-Host "[6/6] Getting website URL..." -ForegroundColor Yellow
$WebsiteUrl = az storage account show --name $StorageAccountName --resource-group $ResourceGroup --query "primaryEndpoints.web" --output tsv

Write-Host "" -ForegroundColor Green
Write-Host "SUCCESS! Deployment completed" -ForegroundColor Green
Write-Host "Website URL: $WebsiteUrl" -ForegroundColor Cyan
Write-Host ""
