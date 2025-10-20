/**
 * Validation Types
 * 
 * Input validation structures and error handling.
 * Based on data-model.md specifications.
 */

/**
 * Validation Error
 * 
 * Single validation error with field and message.
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Error code for programmatic handling */
  code: string;
  
  /** Optional additional context */
  context?: Record<string, unknown>;
}

/**
 * Validation Result
 * 
 * Result of validation with success flag and errors.
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  
  /** Array of validation errors (empty if valid) */
  errors: ValidationError[];
  
  /** Optional warning messages (non-blocking) */
  warnings?: string[];
}

/**
 * Field Validator function type
 * 
 * Function that validates a single field value.
 */
export type FieldValidator<T = unknown> = (value: T) => ValidationResult;

/**
 * Validation rules for all fields
 */
export interface ValidationRules {
  /** Asset pair validation: Must match pattern ^[A-Z]{3,5}-[A-Z]{3}$ */
  assetPair: {
    pattern: RegExp;
    message: string;
  };
  
  /** Start date validation */
  startDate: {
    /** Must be valid ISO 8601 date */
    format: RegExp;
    /** Not in future */
    maxDate: Date;
    /** Minimum historical date (2010-01-01) */
    minDate: Date;
    /** Error messages */
    messages: {
      invalid: string;
      future: string;
      tooOld: string;
    };
  };
  
  /** Investment amount validation */
  investmentAmount: {
    /** Minimum value (1) */
    min: number;
    /** Maximum value (1,000,000) */
    max: number;
    /** Error messages */
    messages: {
      tooLow: string;
      tooHigh: string;
      notNumber: string;
    };
  };
  
  /** Frequency validation */
  frequency: {
    /** Valid frequency values */
    validValues: readonly string[];
    /** Error message */
    message: string;
  };
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  INVALID_DATE = 'INVALID_DATE',
  FUTURE_DATE = 'FUTURE_DATE',
  INVALID_ASSET_PAIR = 'INVALID_ASSET_PAIR',
  INVALID_FREQUENCY = 'INVALID_FREQUENCY',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
}
