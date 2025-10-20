# Azure Blob Storage Deployment Script for Crypto DCA Simulator (PowerShell)
# Usage: .\deploy-azure.ps1 [StorageAccountName] [ResourceGroup]

param(
    [string]$StorageAccountName = "cryptodca$(Get-Date -Format 'yyyyMMddHHmm')",
    [string]$ResourceGroup = "rg-crypto-dca-simulator",
    [string]$Location = "eastus"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Azure Blob Storage deployment for Crypto DCA Simulator" -ForegroundColor Green
Write-Host "Storage Account: $StorageAccountName" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Cyan
Write-Host "Location: $Location" -ForegroundColor Cyan

# Check if Azure CLI is installed
try {
    $null = Get-Command az -ErrorAction Stop
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Azure
try {
    $null = az account show 2>$null
    if ($LASTEXITCODE -ne 0) { throw }
} catch {
    Write-Host "❌ Please log in to Azure CLI first:" -ForegroundColor Red
    Write-Host "az login" -ForegroundColor Yellow
    exit 1
}

# Create resource group if it doesn't exist
Write-Host "📁 Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output table

# Deploy ARM template
Write-Host "🏗️  Deploying storage account..." -ForegroundColor Yellow
az deployment group create `
    --resource-group $ResourceGroup `
    --template-file azure-deploy.json `
    --parameters storageAccountName=$StorageAccountName `
    --output table

# Enable static website hosting
Write-Host "🌐 Enabling static website hosting..." -ForegroundColor Yellow
az storage blob service-properties update `
    --account-name $StorageAccountName `
    --static-website `
    --index-document index.html `
    --404-document index.html

# Build the application
Write-Host "🔨 Building production application..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this script from the crypto-dca-simulator directory." -ForegroundColor Red
    exit 1
}

npm run build

# Check if build directory exists
$BuildDir = "./build"
if (-not (Test-Path $BuildDir)) {
    Write-Host "❌ Build directory not found at $BuildDir" -ForegroundColor Red
    exit 1
}

# Upload files to Azure Blob Storage
Write-Host "📤 Uploading files to Azure Blob Storage..." -ForegroundColor Yellow
az storage blob upload-batch `
    --account-name $StorageAccountName `
    --destination '$web' `
    --source $BuildDir `
    --pattern "*" `
    --overwrite

# Get the website URL
$WebsiteUrl = az storage account show `
    --name $StorageAccountName `
    --resource-group $ResourceGroup `
    --query "primaryEndpoints.web" `
    --output tsv

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌍 Website URL: $WebsiteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit the website URL to verify deployment" -ForegroundColor White
Write-Host "2. Configure custom domain if needed" -ForegroundColor White
Write-Host "3. Set up CDN for better performance (optional)" -ForegroundColor White
Write-Host ""
Write-Host "💡 To update the website, simply run this script again." -ForegroundColor Blue
Write-Host "💰 Storage costs: ~$0.02/month for small static sites" -ForegroundColor Blue