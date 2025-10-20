/**
 * ResultsSummary Component
 * Displays DCA simulation metrics and statistics
 */

import { 
  formatCurrency, 
  formatPercentage, 
  formatCryptoQuantity 
} from '../utils/formatters';
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

export interface ResultsSummaryProps {
  metrics: MetricsData | null;
  isLoading?: boolean;
  assetSymbol?: string;
}

function ResultsSummary({ 
  metrics, 
  isLoading = false, 
  assetSymbol = '' 
}: ResultsSummaryProps) {
  if (isLoading) {
    return (
      <div className="results-container" data-testid="results-container">
        <div className="results-loading">Calculating results...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="results-container" data-testid="results-container">
        <div className="results-empty">No results to display</div>
      </div>
    );
  }

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
