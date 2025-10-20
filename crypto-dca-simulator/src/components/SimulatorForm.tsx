/**
 * SimulatorForm Component
 * Form for DCA simulation parameters input
 */

import { useState, useEffect, ChangeEvent, FormEvent, FocusEvent } from 'react';
import {
  validateAssetPair,
  validateInvestmentAmount,
  validateFrequency,
  validateStartDate,
} from '../utils/validators';
import './simulator.css';

interface AssetPair {
  value: string;
  label: string;
}

interface Frequency {
  value: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  label: string;
}

interface FormData {
  assetPair: string;
  startDate: string;
  investmentAmount: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

interface FormErrors {
  assetPair?: string;
  startDate?: string;
  investmentAmount?: string;
  frequency?: string;
}

interface TouchedFields {
  assetPair?: boolean;
  startDate?: boolean;
  investmentAmount?: boolean;
  frequency?: boolean;
}

export interface SimulatorFormProps {
  onSubmit: (data: SimulatorFormData) => void;
  isLoading?: boolean;
  initialValues?: Partial<SimulatorFormData>;
}

export interface SimulatorFormData {
  assetPair: string;
  startDate: string;
  investmentAmount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

const ASSET_PAIRS: AssetPair[] = [
  { value: 'BTC-USD', label: 'Bitcoin (BTC/USD)' },
  { value: 'BTC-EUR', label: 'Bitcoin (BTC/EUR)' },
  { value: 'ETH-USD', label: 'Ethereum (ETH/USD)' },
  { value: 'ETH-EUR', label: 'Ethereum (ETH/EUR)' },
  { value: 'BNB-USD', label: 'Binance Coin (BNB/USD)' },
  { value: 'ADA-USD', label: 'Cardano (ADA/USD)' },
  { value: 'SOL-USD', label: 'Solana (SOL/USD)' },
  { value: 'XRP-USD', label: 'Ripple (XRP/USD)' },
  { value: 'DOT-USD', label: 'Polkadot (DOT/USD)' },
  { value: 'DOGE-USD', label: 'Dogecoin (DOGE/USD)' },
];

const FREQUENCIES: Frequency[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function SimulatorForm({ onSubmit, isLoading = false, initialValues = {} }: SimulatorFormProps) {
  const [formData, setFormData] = useState<FormData>({
    assetPair: initialValues.assetPair || 'BTC-USD',
    startDate: initialValues.startDate || '',
    investmentAmount: initialValues.investmentAmount?.toString() || '',
    frequency: initialValues.frequency || 'weekly',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  // Update form data when initial values change
  useEffect(() => {
    if (initialValues.assetPair) {
      setFormData((prev) => ({
        ...prev,
        assetPair: initialValues.assetPair || prev.assetPair,
        startDate: initialValues.startDate || prev.startDate,
        investmentAmount: initialValues.investmentAmount?.toString() || prev.investmentAmount,
        frequency: initialValues.frequency || prev.frequency,
      }));
    }
  }, [initialValues]);

  const validateField = (name: keyof FormData, value: string): string | null => {
    let validation;

    switch (name) {
      case 'assetPair':
        validation = validateAssetPair(value);
        break;
      case 'startDate':
        validation = validateStartDate(value);
        break;
      case 'investmentAmount':
        validation = validateInvestmentAmount(Number(value));
        break;
      case 'frequency':
        validation = validateFrequency(value);
        break;
      default:
        return null;
    }

    return validation.valid ? null : validation.error;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (touched[name as keyof TouchedFields]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error || undefined,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      assetPair: true,
      startDate: true,
      investmentAmount: true,
      frequency: true,
    });

    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        ...formData,
        investmentAmount: Number(formData.investmentAmount),
      });
    }
  };

  return (
    <form className="simulator-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="assetPair">Asset Pair</label>
        <select
          id="assetPair"
          name="assetPair"
          value={formData.assetPair}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.assetPair ? 'error' : ''}
          disabled={isLoading}
        >
          {ASSET_PAIRS.map((pair) => (
            <option key={pair.value} value={pair.value}>
              {pair.label}
            </option>
          ))}
        </select>
        {errors.assetPair && <span className="error-message">{errors.assetPair}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.startDate ? 'error' : ''}
          disabled={isLoading}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.startDate && <span className="error-message">{errors.startDate}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="investmentAmount">Investment Amount (USD)</label>
        <input
          type="number"
          id="investmentAmount"
          name="investmentAmount"
          value={formData.investmentAmount}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.investmentAmount ? 'error' : ''}
          disabled={isLoading}
          min="1"
          max="1000000"
          step="1"
          placeholder="e.g., 100"
        />
        {errors.investmentAmount && (
          <span className="error-message">{errors.investmentAmount}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="frequency">Purchase Frequency</label>
        <select
          id="frequency"
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.frequency ? 'error' : ''}
          disabled={isLoading}
        >
          {FREQUENCIES.map((freq) => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </select>
        {errors.frequency && <span className="error-message">{errors.frequency}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Simulate DCA'}
      </button>
    </form>
  );
}

export default SimulatorForm;
