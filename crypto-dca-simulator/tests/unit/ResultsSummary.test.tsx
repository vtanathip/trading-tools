/**
 * Unit tests for ResultsSummary component
 * Tests metrics display and formatting
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ResultsSummary from '../../src/components/ResultsSummary';

describe('ResultsSummary Component', () => {
  const mockMetrics = {
    totalInvested: 1000,
    currentValue: 1250,
    profitLoss: 250,
    profitLossPercent: 25,
    averagePrice: 45000,
    totalQuantity: 0.027,
  };

  it('should render all metrics', () => {
    render(<ResultsSummary metrics={mockMetrics} />);
    
    expect(screen.getByText(/total invested/i)).toBeInTheDocument();
    expect(screen.getByText(/current value/i)).toBeInTheDocument();
    expect(screen.getByText(/profit\/loss/i)).toBeInTheDocument();
    expect(screen.getByText(/average price/i)).toBeInTheDocument();
    expect(screen.getByText(/total quantity/i)).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    render(<ResultsSummary metrics={mockMetrics} />);
    
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
  });

  it('should display profit with positive styling', () => {
    render(<ResultsSummary metrics={mockMetrics} />);
    
    const profitElement = screen.getByText('+$250.00');
    expect(profitElement).toHaveClass('profit-positive');
  });

  it('should display loss with negative styling', () => {
    const lossMetrics = {
      ...mockMetrics,
      profitLoss: -150,
      profitLossPercent: -15,
      currentValue: 850,
    };
    
    render(<ResultsSummary metrics={lossMetrics} />);
    
    const lossElement = screen.getByText('-$150.00');
    expect(lossElement).toHaveClass('profit-negative');
  });

  it('should display percentage correctly', () => {
    render(<ResultsSummary metrics={mockMetrics} />);
    
    expect(screen.getByText('+25.00%')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<ResultsSummary metrics={null} isLoading={true} />);
    
    expect(screen.getByText(/calculating results/i)).toBeInTheDocument();
  });

  it('should display empty state when no metrics', () => {
    render(<ResultsSummary metrics={null} />);
    
    expect(screen.getByText(/no results to display/i)).toBeInTheDocument();
  });

  it('should format crypto quantity correctly', () => {
    render(<ResultsSummary metrics={mockMetrics} assetSymbol="BTC" />);
    
    expect(screen.getByText('0.027 BTC')).toBeInTheDocument();
  });

  it('should handle zero profit/loss', () => {
    const zeroMetrics = {
      ...mockMetrics,
      profitLoss: 0,
      profitLossPercent: 0,
      currentValue: 1000,
    };
    
    render(<ResultsSummary metrics={zeroMetrics} />);
    
    const profitElement = screen.getByText('$0.00');
    expect(profitElement).toHaveClass('profit-neutral');
  });

  it('should display additional stats', () => {
    render(<ResultsSummary metrics={mockMetrics} />);
    
    expect(screen.getByText('$45,000.00')).toBeInTheDocument(); // Average price
  });
});
