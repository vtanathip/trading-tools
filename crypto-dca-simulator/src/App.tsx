/**
 * Main application component
 * Integrates SimulatorForm, ChartDisplay, and ResultsSummary
 */

import { useState } from 'react';
import SimulatorForm, { SimulatorFormData } from './components/SimulatorForm';
import ChartDisplay from './components/ChartDisplay';
import ResultsSummary from './components/ResultsSummary';
import { calculateDCA } from './services/dcaCalculator';
import type { DCAResults } from './services/dcaCalculator';

interface AppState {
  simulationData: DCAResults | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: AppState = {
  simulationData: null,
  isLoading: false,
  error: null,
};

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const handleSimulationSubmit = async (formData: SimulatorFormData): Promise<void> => {
    setState({ ...INITIAL_STATE, isLoading: true });

    try {
      const result = await calculateDCA({
        assetPair: formData.assetPair,
        startDate: formData.startDate,
        investmentAmount: formData.investmentAmount,
        frequency: formData.frequency,
      });

      setState({
        simulationData: result,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to run simulation. Please try again.';
      
      setState({
        simulationData: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  };

  const handleReset = (): void => {
    setState(INITIAL_STATE);
  };

  // Extract asset symbol from asset pair (e.g., "BTC-USD" -> "BTC")
  const assetSymbol = state.simulationData 
    ? state.simulationData.dateRange.start.split('-')[0] // Fallback: extract from pair if needed
    : '';

  return (
    <div className="app">
      <header className="app-header">
        <h1>Crypto DCA Simulator</h1>
        <p className="app-description">
          Calculate your Dollar-Cost Averaging returns with historical crypto data
        </p>
      </header>

      <main className="app-main">
        <SimulatorForm 
          onSubmit={handleSimulationSubmit} 
          isLoading={state.isLoading}
        />

        {state.error && (
          <div className="app-error" role="alert">
            <strong>Error:</strong> {state.error}
            <button onClick={handleReset} className="error-reset-btn">
              Try Again
            </button>
          </div>
        )}

        {state.simulationData && (
          <>
            <ResultsSummary 
              metrics={state.simulationData.metrics}
              assetSymbol={assetSymbol}
            />
            
            <ChartDisplay 
              data={state.simulationData}
              title="Portfolio Value Over Time"
            />

            <div className="app-actions">
              <button onClick={handleReset} className="btn btn-secondary">
                Run Another Simulation
              </button>
            </div>
          </>
        )}

        {!state.simulationData && !state.error && !state.isLoading && (
          <div className="app-empty">
            <p>Enter your DCA parameters above to see results</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Data provided by <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
