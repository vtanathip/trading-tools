/**
 * Unit tests for SimulatorForm component
 * Tests form validation and submission
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SimulatorForm from '../../src/components/SimulatorForm';

describe('SimulatorForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render all form fields', () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/asset pair/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/investment amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simulate/i })).toBeInTheDocument();
  });

  it('should display default values', () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    const assetPairSelect = screen.getByLabelText(/asset pair/i) as HTMLSelectElement;
    expect(assetPairSelect.value).toBe('BTC-USD');
  });

  it('should submit form with valid data', async () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    const assetPairSelect = screen.getByLabelText(/asset pair/i) as HTMLSelectElement;
    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
    const amountInput = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
    const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;
    const submitButton = screen.getByRole('button', { name: /simulate/i });

    fireEvent.change(assetPairSelect, { target: { value: 'BTC-USD' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.change(frequencySelect, { target: { value: 'weekly' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        assetPair: 'BTC-USD',
        startDate: '2024-01-01',
        investmentAmount: 100,
        frequency: 'weekly',
      });
    });
  });

  it('should show validation error for missing asset pair', async () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    const assetPairSelect = screen.getByLabelText(/asset pair/i) as HTMLSelectElement;
    const submitButton = screen.getByRole('button', { name: /simulate/i });

    fireEvent.change(assetPairSelect, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/asset pair is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for future start date', async () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /simulate/i });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateString = futureDate.toISOString().split('T')[0];

    fireEvent.change(startDateInput, { target: { value: futureDateString } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/cannot simulate future dates/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid investment amount', async () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /simulate/i });

    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/investment amount must be at least/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should disable submit button while loading', () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /loading/i });
    expect(submitButton).toBeDisabled();
  });

  it('should clear validation errors when input changes', async () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /simulate/i });

    // Trigger validation error
    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/investment amount must be at least/i)).toBeInTheDocument();
    });

    // Fix the input
    fireEvent.change(amountInput, { target: { value: '100' } });

    await waitFor(() => {
      expect(screen.queryByText(/investment amount must be at least/i)).not.toBeInTheDocument();
    });
  });

  it('should handle all frequency options', () => {
    render(<SimulatorForm onSubmit={mockOnSubmit} />);

    const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;
    const options = Array.from(frequencySelect.options).map((opt) => opt.value);

    expect(options).toContain('daily');
    expect(options).toContain('weekly');
    expect(options).toContain('biweekly');
    expect(options).toContain('monthly');
  });

  it('should populate form with initial values', () => {
    const initialValues = {
      assetPair: 'ETH-USD',
      startDate: '2023-06-01',
      investmentAmount: 250,
      frequency: 'monthly' as const,
    };

    render(<SimulatorForm onSubmit={mockOnSubmit} initialValues={initialValues} />);

    const assetPairSelect = screen.getByLabelText(/asset pair/i) as HTMLSelectElement;
    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
    const amountInput = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
    const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;

    expect(assetPairSelect.value).toBe('ETH-USD');
    expect(startDateInput.value).toBe('2023-06-01');
    expect(amountInput.value).toBe('250');
    expect(frequencySelect.value).toBe('monthly');
  });
});
