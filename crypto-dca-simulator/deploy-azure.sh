#!/bin/bash

# Azure Blob Storage Deployment Script for Crypto DCA Simulator
# Usage: ./deploy-azure.sh [storage-account-name] [resource-group]

set -e

# Configuration
STORAGE_ACCOUNT_NAME=${1:-"cryptodca$(date +%Y%m%d%H%M)"}
RESOURCE_GROUP=${2:-"rg-crypto-dca-simulator"}
LOCATION="eastus"
BUILD_DIR="./build"

echo "🚀 Starting Azure Blob Storage deployment for Crypto DCA Simulator"
echo "Storage Account: $STORAGE_ACCOUNT_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Please log in to Azure CLI first:"
    echo "az login"
    exit 1
fi

# Create resource group if it doesn't exist
echo "📁 Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output table

# Deploy ARM template
echo "🏗️  Deploying storage account..."
az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file azure-deploy.json \
    --parameters storageAccountName="$STORAGE_ACCOUNT_NAME" \
    --output table

# Enable static website hosting
echo "🌐 Enabling static website hosting..."
az storage blob service-properties update \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --static-website \
    --index-document index.html \
    --404-document index.html

# Build the application
echo "🔨 Building production application..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the crypto-dca-simulator directory."
    exit 1
fi

npm run build

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found at $BUILD_DIR"
    exit 1
fi

# Upload files to Azure Blob Storage
echo "📤 Uploading files to Azure Blob Storage..."
az storage blob upload-batch \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --destination '$web' \
    --source "$BUILD_DIR" \
    --pattern "*" \
    --overwrite

# Get the website URL
WEBSITE_URL=$(az storage account show \
    --name "$STORAGE_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "primaryEndpoints.web" \
    --output tsv)

echo ""
echo "✅ Deployment completed successfully!"
echo "🌍 Website URL: $WEBSITE_URL"
echo ""
echo "📋 Next steps:"
echo "1. Visit the website URL to verify deployment"
echo "2. Configure custom domain if needed"
echo "3. Set up CDN for better performance (optional)"
echo ""
echo "💡 To update the website, simply run this script again."
echo "💰 Storage costs: ~$0.02/month for small static sites"