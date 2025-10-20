/**
 * ResultsSummary Component
 * Displays DCA simulation metrics and statistics
 */

import { 
  formatCurrency, 
  formatPercentage, 
  formatCryptoQuantity 
} from '../utils/formatters';
import type { SimulationResults } from '../types';
import './results.css';

const NEUTRAL_THRESHOLD = 0.01;

export interface MetricsData {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  averagePrice: number;
  totalQuantity: number;
}

export interface AssetMetrics {
  assetPair: string;
  metrics: SimulationResults | MetricsData;
}

export interface ResultsSummaryProps {
  metrics?: MetricsData | null;
  multiAssetMetrics?: AssetMetrics[];
  isLoading?: boolean;
  assetSymbol?: string;
  showComparison?: boolean;
}

function ResultsSummary({ 
  metrics, 
  multiAssetMetrics,
  isLoading = false, 
  assetSymbol = '',
  showComparison = false
}: ResultsSummaryProps) {
  // Helper functions
  const getProfitClass = (profitLoss: number): string => {
    if (Math.abs(profitLoss) < NEUTRAL_THRESHOLD) return 'profit-neutral';
    return profitLoss > 0 ? 'profit-positive' : 'profit-negative';
  };

  const formatProfitLoss = (value: number): string => {
    const formatted = formatCurrency(Math.abs(value));
    if (value > NEUTRAL_THRESHOLD) return `+${formatted}`;
    if (value < -NEUTRAL_THRESHOLD) return `-${formatted}`;
    return formatted;
  };

  const formatPercentageChange = (value: number): string => {
    if (value > NEUTRAL_THRESHOLD) return `+${formatPercentage(value)}`;
    if (value < -NEUTRAL_THRESHOLD) return formatPercentage(value);
    return formatPercentage(0);
  };

  if (isLoading) {
    return (
      <div className="results-container" data-testid="results-container">
        <div className="results-loading">Calculating results...</div>
      </div>
    );
  }

  // Handle multi-asset comparison
  if (showComparison && multiAssetMetrics && multiAssetMetrics.length > 0) {
    const totalInvested = multiAssetMetrics.reduce((sum, asset) => sum + asset.metrics.totalInvested, 0);
    const totalCurrentValue = multiAssetMetrics.reduce((sum, asset) => sum + asset.metrics.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return (
      <div className="results-container" data-testid="results-container">
        <div className="comparison-results">
          <h2>Portfolio Comparison</h2>
          
          <div className="comparison-grid">
            {multiAssetMetrics.map((assetMetric) => (
              <div key={assetMetric.assetPair} className="asset-summary-card">
                <h3 className="asset-title">{assetMetric.assetPair}</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Current Value</span>
                    <span className="metric-value">
                      {formatCurrency(assetMetric.metrics.currentValue)}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Total Invested</span>
                    <span className="metric-value">
                      {formatCurrency(assetMetric.metrics.totalInvested)}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Profit/Loss</span>
                    <span className={`metric-value ${getProfitClass(assetMetric.metrics.profitLoss)}`}>
                      {formatProfitLoss(assetMetric.metrics.profitLoss)}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Return</span>
                    <span className={`metric-value ${getProfitClass(assetMetric.metrics.profitLoss)}`}>
                      {formatPercentageChange(assetMetric.metrics.profitLossPercent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Portfolio totals */}
          <div className="portfolio-totals">
            <h3>Portfolio Totals</h3>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Total Investment</span>
                <span className="total-value">
                  {formatCurrency(totalInvested)}
                </span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Value</span>
                <span className="total-value">
                  {formatCurrency(totalCurrentValue)}
                </span>
              </div>
              <div className="total-item">
                <span className="total-label">Total P/L</span>
                <span className={`total-value ${getProfitClass(totalProfitLoss)}`}>
                  {formatProfitLoss(totalProfitLoss)}
                </span>
              </div>
              <div className="total-item">
                <span className="total-label">Portfolio Return</span>
                <span className={`total-value ${getProfitClass(totalProfitLoss)}`}>
                  {formatPercentageChange(totalProfitLossPercent)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle single asset (backward compatibility)
  if (!metrics) {
    return (
      <div className="results-container" data-testid="results-container">
        <div className="results-empty">No results to display</div>
      </div>
    );
  }

  return (
    <div className="results-container" data-testid="results-container">
      <h3 className="results-title">Simulation Results</h3>
      
      <div className="results-grid">
        {/* Primary Metrics */}
        <div className="metric-card metric-primary">
          <span className="metric-label">Total Invested</span>
          <span className="metric-value">
            {formatCurrency(metrics.totalInvested)}
          </span>
        </div>

        <div className="metric-card metric-primary">
          <span className="metric-label">Current Value</span>
          <span className="metric-value">
            {formatCurrency(metrics.currentValue)}
          </span>
        </div>

        <div className="metric-card metric-highlight">
          <span className="metric-label">Profit/Loss</span>
          <span className={`metric-value ${getProfitClass(metrics.profitLoss)}`}>
            {formatProfitLoss(metrics.profitLoss)}
            <span className="metric-percentage">
              {formatPercentageChange(metrics.profitLossPercent)}
            </span>
          </span>
        </div>

        {/* Secondary Metrics */}
        <div className="metric-card">
          <span className="metric-label">Average Price</span>
          <span className="metric-value metric-secondary">
            {formatCurrency(metrics.averagePrice)}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Quantity</span>
          <span className="metric-value metric-secondary">
            {formatCryptoQuantity(metrics.totalQuantity, assetSymbol)}{assetSymbol ? ` ${assetSymbol}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResultsSummary;
