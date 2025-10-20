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

interface AssetResult {
  assetPair: string;
  simulationData: DCAResults;
}

interface AppState {
  simulationData: DCAResults | null;
  currentAssetPair: string | null;
  assetResults: AssetResult[];
  isComparisonMode: boolean;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: AppState = {
  simulationData: null,
  currentAssetPair: null,
  assetResults: [],
  isComparisonMode: false,
  isLoading: false,
  error: null,
};

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const handleSimulationSubmit = async (formData: SimulatorFormData): Promise<void> => {
    // If in comparison mode, add as new asset instead of replacing
    if (state.isComparisonMode) {
      return handleAddAsset(formData);
    }

    setState({ ...INITIAL_STATE, isLoading: true });

    try {
      const result = await calculateDCA({
        assetPair: formData.assetPair,
        startDate: formData.startDate,
        investmentAmount: formData.investmentAmount,
        frequency: formData.frequency,
      });

      setState(prevState => ({
        ...prevState,
        simulationData: result,
        currentAssetPair: formData.assetPair, // Store the asset pair
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to run simulation. Please try again.';
      
      setState(prevState => ({
        ...prevState,
        simulationData: null,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleReset = (): void => {
    setState(INITIAL_STATE);
  };

  const toggleComparisonMode = (): void => {
    setState(prevState => ({
      ...prevState,
      isComparisonMode: !prevState.isComparisonMode,
      // When entering comparison mode, add current simulation as first asset
      assetResults: !prevState.isComparisonMode && prevState.simulationData && prevState.currentAssetPair
        ? [{
            assetPair: prevState.currentAssetPair,
            simulationData: prevState.simulationData
          }]
        : prevState.assetResults
    }));
  };

  const handleAddAsset = async (formData: SimulatorFormData): Promise<void> => {
    // Check if asset already exists
    const assetExists = state.assetResults.some(
      asset => asset.assetPair === formData.assetPair
    );
    
    if (assetExists) {
      setState(prevState => ({
        ...prevState,
        error: `${formData.assetPair} is already in the comparison`
      }));
      return;
    }

    // Check maximum assets limit
    if (state.assetResults.length >= 5) {
      setState(prevState => ({
        ...prevState,
        error: 'Maximum 5 assets allowed for comparison'
      }));
      return;
    }

    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      const result = await calculateDCA({
        assetPair: formData.assetPair,
        startDate: formData.startDate,
        investmentAmount: formData.investmentAmount,
        frequency: formData.frequency,
      });

      setState(prevState => ({
        ...prevState,
        assetResults: [...prevState.assetResults, {
          assetPair: formData.assetPair,
          simulationData: result
        }],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add asset simulation. Please try again.';
      
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleRemoveAsset = (assetPair: string): void => {
    setState(prevState => ({
      ...prevState,
      assetResults: prevState.assetResults.filter(
        asset => asset.assetPair !== assetPair
      ),
    }));
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
        <div className="app-controls">
          <SimulatorForm 
            onSubmit={handleSimulationSubmit} 
            isLoading={state.isLoading}
          />
          
          {/* Comparison mode toggle */}
          {(state.simulationData || state.assetResults.length > 0) && (
            <div className="comparison-controls">
              <button 
                onClick={toggleComparisonMode}
                className={`btn ${state.isComparisonMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {state.isComparisonMode ? 'Exit Comparison' : 'Compare Assets'}
              </button>
            </div>
          )}
        </div>

        {state.error && (
          <div className="app-error" role="alert">
            <strong>Error:</strong> {state.error}
            <button onClick={handleReset} className="error-reset-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Comparison Mode */}
        {state.isComparisonMode && state.assetResults.length > 0 && (
          <>
            <div className="comparison-notice">
              <p>Comparing {state.assetResults.length} assets</p>
            </div>
            
            <ResultsSummary 
              multiAssetMetrics={state.assetResults.map(asset => ({
                assetPair: asset.assetPair,
                metrics: {
                  totalInvested: asset.simulationData.metrics.totalInvested,
                  currentValue: asset.simulationData.metrics.currentValue,
                  profitLoss: asset.simulationData.metrics.profitLoss,
                  profitLossPercent: asset.simulationData.metrics.profitLossPercent,
                  averagePrice: asset.simulationData.metrics.averagePrice,
                  totalQuantity: asset.simulationData.metrics.totalQuantity,
                }
              }))}
              showComparison={true}
            />

            <div className="comparison-assets">
              {state.assetResults.map((asset) => (
                <div key={asset.assetPair} className="asset-card">
                  <div className="asset-header">
                    <h3>{asset.assetPair}</h3>
                    <button 
                      onClick={() => handleRemoveAsset(asset.assetPair)}
                      className="btn btn-small btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                  <ChartDisplay 
                    data={asset.simulationData}
                    title={`${asset.assetPair} Performance`}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Single Asset Mode */}
        {!state.isComparisonMode && state.simulationData && (
          <>
            <ResultsSummary 
              metrics={state.simulationData.metrics}
              assetSymbol={assetSymbol}
            />
            
            <ChartDisplay 
              data={state.simulationData}
              title="Portfolio Value Over Time"
            />
          </>
        )}

        {/* Action buttons */}
        {(state.simulationData || state.assetResults.length > 0) && (
          <div className="app-actions">
            <button onClick={handleReset} className="btn btn-secondary">
              Start Over
            </button>
          </div>
        )}

        {/* Empty state */}
        {!state.simulationData && state.assetResults.length === 0 && !state.error && !state.isLoading && (
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
