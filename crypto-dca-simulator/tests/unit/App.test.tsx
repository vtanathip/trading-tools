/**
 * Unit tests for main App component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import * as dcaCalculator from '../../src/services/dcaCalculator';
import type { DCAResults } from '../../src/services/dcaCalculator';

// Mock the dcaCalculator service
jest.mock('../../src/services/dcaCalculator');
const mockCalculateDCA = dcaCalculator.calculateDCA as jest.MockedFunction<typeof dcaCalculator.calculateDCA>;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders app header and description', () => {
    render(<App />);
    
    expect(screen.getByText('Crypto DCA Simulator')).toBeInTheDocument();
    expect(screen.getByText(/Calculate your Dollar-Cost Averaging returns/)).toBeInTheDocument();
  });

  test('renders simulator form', () => {
    render(<App />);
    
    expect(screen.getByLabelText(/Asset Pair/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Investment Amount/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Purchase Frequency/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simulate DCA/ })).toBeInTheDocument();
  });

  test('displays empty state initially', () => {
    render(<App />);
    
    expect(screen.getByText('Enter your DCA parameters above to see results')).toBeInTheDocument();
  });

  test('handles successful simulation submission', async () => {
    const mockResult: DCAResults = {
      purchases: [{
        date: '2023-01-01',
        timestamp: 1672531200,
        price: 50000,
        quantity: 0.002,
        invested: 100,
        runningTotal: 0.002
      }],
      metrics: {
        totalInvested: 1000,
        totalQuantity: 0.02,
        currentValue: 1500,
        profitLoss: 500,
        profitLossPercent: 50,
        averagePrice: 50000,
        currentPrice: 75000,
        purchases: []
      },
      currentPrice: 75000,
      totalPurchases: 10,
      dateRange: {
        start: '2023-01-01',
        end: '2024-01-01'
      }
    };

    mockCalculateDCA.mockResolvedValueOnce(mockResult);

    render(<App />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Investment Amount/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Start Date/), { target: { value: '2023-01-01' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Simulate DCA/ }));

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByTestId('results-container')).toBeInTheDocument();
    });

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Over/ })).toBeInTheDocument();
  });

  test('handles simulation error', async () => {
    const errorMessage = 'API error occurred';
    mockCalculateDCA.mockRejectedValueOnce(new Error(errorMessage));

    render(<App />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Investment Amount/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Start Date/), { target: { value: '2023-01-01' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Simulate DCA/ }));

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/ })).toBeInTheDocument();
  });

  test('handles reset functionality after error', async () => {
    mockCalculateDCA.mockRejectedValueOnce(new Error('Test error'));

    render(<App />);
    
    // Trigger error
    fireEvent.change(screen.getByLabelText(/Investment Amount/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Start Date/), { target: { value: '2023-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Simulate DCA/ }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Click reset button
    fireEvent.click(screen.getByRole('button', { name: /Try Again/ }));

    // Should return to empty state
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Enter your DCA parameters above to see results')).toBeInTheDocument();
  });

  test('handles reset functionality after successful simulation', async () => {
    const mockResult: DCAResults = {
      purchases: [{
        date: '2023-01-01',
        timestamp: 1672531200,
        price: 50000,
        quantity: 0.002,
        invested: 100,
        runningTotal: 0.002
      }],
      metrics: {
        totalInvested: 1000,
        totalQuantity: 0.02,
        currentValue: 1500,
        profitLoss: 500,
        profitLossPercent: 50,
        averagePrice: 50000,
        currentPrice: 75000,
        purchases: []
      },
      currentPrice: 75000,
      totalPurchases: 10,
      dateRange: {
        start: '2023-01-01',
        end: '2024-01-01'
      }
    };

    mockCalculateDCA.mockResolvedValueOnce(mockResult);

    render(<App />);
    
    // Complete simulation
    fireEvent.change(screen.getByLabelText(/Investment Amount/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Start Date/), { target: { value: '2023-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Simulate DCA/ }));

    await waitFor(() => {
      expect(screen.getByTestId('results-container')).toBeInTheDocument();
    });

    // Click reset button
    fireEvent.click(screen.getByRole('button', { name: /Start Over/ }));

    // Should return to empty state
    expect(screen.queryByTestId('results-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument();
    expect(screen.getByText('Enter your DCA parameters above to see results')).toBeInTheDocument();
  });

  test('displays loading state during simulation', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockCalculateDCA.mockReturnValueOnce(slowPromise as any);

    render(<App />);
    
    // Start simulation
    fireEvent.change(screen.getByLabelText(/Investment Amount/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Start Date/), { target: { value: '2023-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Simulate DCA/ }));

    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({
      purchases: [{
        date: '2023-01-01',
        timestamp: 1672531200,
        price: 50000,
        quantity: 0.002,
        invested: 100,
        runningTotal: 0.002
      }],
      metrics: {
        totalInvested: 1000,
        totalQuantity: 0.02,
        currentValue: 1500,
        profitLoss: 500,
        profitLossPercent: 50,
        averagePrice: 50000,
        currentPrice: 75000,
        purchases: []
      },
      currentPrice: 75000,
      totalPurchases: 10,
      dateRange: { start: '2023-01-01', end: '2024-01-01' }
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  test('renders footer with data attribution', () => {
    render(<App />);
    
    expect(screen.getByText('Data provided by')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CoinGecko/ })).toBeInTheDocument();
  });

  test('handles non-Error exceptions', async () => {
    mockCalculateDCA.mockRejectedValueOnce('String error');

    render(<App />);
    
    fireEvent.change(screen.getByLabelText(/Investment Amount/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Start Date/), { target: { value: '2023-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Simulate DCA/ }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to run simulation. Please try again.')).toBeInTheDocument();
  });
});