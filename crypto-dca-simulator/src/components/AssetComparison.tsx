/**
 * AssetComparison Component
 * 
 * Displays multiple asset simulation results side by side for comparison.
 * Allows users to add up to 5 assets and compare their DCA performance.
 */

import React from 'react';
import type { SimulationResults } from '../types';

export interface AssetResult {
  assetPair: string;
  results: SimulationResults;
}

export interface AssetComparisonProps {
  assetResults: AssetResult[];
  onRemoveAsset: (assetPair: string) => void;
  onAddAsset: () => void;
}

const AssetComparison: React.FC<AssetComparisonProps> = ({
  assetResults,
  onRemoveAsset,
  onAddAsset,
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatProfitLoss = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatCurrency(value)}`;
  };

  if (assetResults.length === 0) {
    return (
      <div className="asset-comparison" data-testid="asset-comparison">
        <div className="empty-state">
          <p>No assets added for comparison</p>
          <button onClick={onAddAsset} className="add-asset-btn">
            Add Asset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-comparison" data-testid="asset-comparison">
      <div className="comparison-header">
        <h2>Asset Comparison</h2>
        {assetResults.length < 5 && (
          <button onClick={onAddAsset} className="add-asset-btn">
            Add Asset
          </button>
        )}
      </div>

      <div className="assets-grid">
        {assetResults.map((asset) => (
          <div
            key={asset.assetPair}
            className="asset-card"
            data-testid={`asset-${asset.assetPair}`}
          >
            <div className="asset-header">
              <h3>{asset.assetPair}</h3>
              <button
                onClick={() => onRemoveAsset(asset.assetPair)}
                className="remove-btn"
                aria-label={`Remove ${asset.assetPair}`}
              >
                Remove
              </button>
            </div>

            <div className="asset-metrics">
              <div className="metric">
                <label>Current Value</label>
                <span className="value">
                  {formatCurrency(asset.results.currentValue)}
                </span>
              </div>

              <div className="metric">
                <label>Total Invested</label>
                <span className="value">
                  {formatCurrency(asset.results.totalInvested)}
                </span>
              </div>

              <div className="metric">
                <label>Profit/Loss</label>
                <span
                  className={`value ${
                    asset.results.profitLoss >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {formatProfitLoss(asset.results.profitLoss)}
                </span>
              </div>

              <div className="metric">
                <label>Profit/Loss %</label>
                <span
                  className={`value ${
                    asset.results.profitLossPercent >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {formatPercentage(asset.results.profitLossPercent)}
                </span>
              </div>

              <div className="metric">
                <label>Average Price</label>
                <span className="value">
                  {formatCurrency(asset.results.averagePrice)}
                </span>
              </div>

              <div className="metric">
                <label>Current Price</label>
                <span className="value">
                  {formatCurrency(asset.results.currentPrice)}
                </span>
              </div>

              <div className="metric">
                <label>Total Quantity</label>
                <span className="value">
                  {asset.results.totalQuantity.toFixed(8)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetComparison;