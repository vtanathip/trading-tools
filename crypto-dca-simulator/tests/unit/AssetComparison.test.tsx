/**
 * Unit tests for AssetComparison component
 * Tests multi-asset state management and display functionality
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetComparison from '../../src/components/AssetComparison';
import type { SimulationResults } from '../../src/types';

const mockSimulationResults: SimulationResults = {
  config: {
    id: 'test-1',
    assetPair: 'BTC-USD',
    startDate: '2024-01-01',
    investmentAmount: 100,
    frequency: 'weekly',
    createdAt: Date.now(),
  },
  purchases: [
    { 
      date: '2024-01-01', 
      price: 45000, 
      amountInvested: 100, 
      quantityAcquired: 0.00222,
      cumulativeInvested: 100,
      cumulativeQuantity: 0.00222,
      portfolioValue: 100,
      profitLoss: 0,
      profitLossPercent: 0
    },
    { 
      date: '2024-01-08', 
      price: 44000, 
      amountInvested: 100, 
      quantityAcquired: 0.00227,
      cumulativeInvested: 200,
      cumulativeQuantity: 0.00449,
      portfolioValue: 200,
      profitLoss: 0,
      profitLossPercent: 0
    },
  ],
  totalInvested: 200,
  currentValue: 210,
  totalQuantity: 0.00449,
  profitLoss: 10,
  profitLossPercent: 5.0,
  averagePrice: 44500,
  currentPrice: 46800,
  calculatedAt: Date.now(),
  dataSource: 'coingecko',
  firstPurchaseDate: '2024-01-01',
  lastPurchaseDate: '2024-01-08',
  totalPurchases: 2,
};

describe('AssetComparison Component', () => {
  const mockOnRemoveAsset = jest.fn();
  const mockOnAddAsset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render asset list with simulation results', () => {
    const assetResults = [
      { assetPair: 'BTC-USD', results: mockSimulationResults },
      { assetPair: 'ETH-USD', results: { ...mockSimulationResults, currentPrice: 3200 } },
    ];

    render(
      <AssetComparison
        assetResults={assetResults}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.getByText('ETH-USD')).toBeInTheDocument();
  });

  it('should display metrics for each asset', () => {
    const assetResults = [
      { assetPair: 'BTC-USD', results: mockSimulationResults },
    ];

    render(
      <AssetComparison
        assetResults={assetResults}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    expect(screen.getByText('$210.00')).toBeInTheDocument(); // Current value
    expect(screen.getByText('$200.00')).toBeInTheDocument(); // Total invested
    expect(screen.getByText('+$10.00')).toBeInTheDocument(); // Profit/loss
    expect(screen.getByText('+5.00%')).toBeInTheDocument(); // Profit/loss %
  });

  it('should handle remove asset action', () => {
    const assetResults = [
      { assetPair: 'BTC-USD', results: mockSimulationResults },
      { assetPair: 'ETH-USD', results: { ...mockSimulationResults, currentPrice: 3200 } },
    ];

    render(
      <AssetComparison
        assetResults={assetResults}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    if (removeButtons[0]) {
      fireEvent.click(removeButtons[0]);
    }

    expect(mockOnRemoveAsset).toHaveBeenCalledWith('BTC-USD');
  });

  it('should display add asset button when under maximum', () => {
    const assetResults = [
      { assetPair: 'BTC-USD', results: mockSimulationResults },
    ];

    render(
      <AssetComparison
        assetResults={assetResults}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    const addButton = screen.getByText('Add Asset');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    expect(mockOnAddAsset).toHaveBeenCalled();
  });

  it('should hide add asset button at maximum assets (5)', () => {
    const assetResults = [
      { assetPair: 'BTC-USD', results: mockSimulationResults },
      { assetPair: 'ETH-USD', results: mockSimulationResults },
      { assetPair: 'ADA-USD', results: mockSimulationResults },
      { assetPair: 'SOL-USD', results: mockSimulationResults },
      { assetPair: 'DOT-USD', results: mockSimulationResults },
    ];

    render(
      <AssetComparison
        assetResults={assetResults}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    expect(screen.queryByText('Add Asset')).not.toBeInTheDocument();
  });

  it('should display empty state when no assets', () => {
    render(
      <AssetComparison
        assetResults={[]}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    expect(screen.getByText('No assets added for comparison')).toBeInTheDocument();
  });

  it('should format negative profit/loss correctly', () => {
    const lossResults = {
      ...mockSimulationResults,
      currentValue: 180,
      profitLoss: -20,
      profitLossPercent: -10.0,
    };

    const assetResults = [
      { assetPair: 'BTC-USD', results: lossResults },
    ];

    render(
      <AssetComparison
        assetResults={assetResults}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    expect(screen.getByText('-$20.00')).toBeInTheDocument();
    expect(screen.getByText('-10.00%')).toBeInTheDocument();
  });

  it('should handle asset with zero profit/loss', () => {
    const breakEvenResults = {
      ...mockSimulationResults,
      currentValue: 200,
      profitLoss: 0,
      profitLossPercent: 0,
    };

    const assetResults = [
      { assetPair: 'BTC-USD', results: breakEvenResults },
    ];

    render(
      <AssetComparison
        assetResults={assetResults}
        onRemoveAsset={mockOnRemoveAsset}
        onAddAsset={mockOnAddAsset}
      />
    );

    expect(screen.getByText('+$0.00')).toBeInTheDocument();
    expect(screen.getByText('+0.00%')).toBeInTheDocument();
  });
});