/**
 * ChartDisplay Component
 * Wraps Chart.js to display DCA simulation results
 */

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Chart as ChartType } from 'chart.js/auto';
import type { DCAResults } from '../services/dcaCalculator';
import type { SimulationResults } from '../types';
import './chart.css';

export interface ChartDataset {
  assetPair: string;
  data: SimulationResults;
  color: string;
}

export interface ChartDisplayProps {
  data?: DCAResults | null;
  datasets?: ChartDataset[];
  isLoading?: boolean;
  title?: string;
  showInvestedLine?: boolean;
}

const ASSET_COLORS = [
  'rgb(37, 99, 235)', // Blue
  'rgb(239, 68, 68)', // Red
  'rgb(34, 197, 94)', // Green
  'rgb(245, 158, 11)', // Yellow
  'rgb(139, 92, 246)', // Purple
];

function prepareSingleAssetChartData(data: DCAResults, showInvestedLine: boolean) {
  const labels = data.purchases.map((p) => p.date);
  const portfolioValues = data.purchases.map((p) => p.runningTotal);
  const investedValues = data.purchases.map((p) => p.runningInvested ?? 0);

  const datasets = [
    {
      label: 'Portfolio Value',
      data: portfolioValues,
      borderColor: ASSET_COLORS[0],
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      tension: 0.1,
      fill: true,
    },
  ];

  if (showInvestedLine) {
    datasets.push({
      label: 'Total Invested',
      data: investedValues,
      borderColor: 'rgb(156, 163, 175)',
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      borderWidth: 2,
      tension: 0.1,
      fill: false,
      borderDash: [5, 5],
    } as any);
  }

  return { labels, datasets };
}

function prepareMultiAssetChartData(datasets: ChartDataset[], showInvestedLine: boolean) {
  // Find the date range that covers all assets
  let allDates: string[] = [];
  datasets.forEach(dataset => {
    const dates = dataset.data.purchases.map(p => p.date);
    allDates = [...allDates, ...dates];
  });
  
  // Remove duplicates and sort
  const uniqueDates = [...new Set(allDates)].sort();
  
  const chartDatasets = datasets.map((dataset, index) => {
    // Map portfolio values to the common date range
    const portfolioValuesByDate: { [key: string]: number } = {};
    dataset.data.purchases.forEach(purchase => {
      portfolioValuesByDate[purchase.date] = purchase.cumulativeInvested * (dataset.data.currentPrice / purchase.price);
    });

    // Fill in missing dates with interpolation or last known value
    const portfolioValues = uniqueDates.map(date => {
      return portfolioValuesByDate[date] ?? 0;
    });

    return {
      label: dataset.assetPair,
      data: portfolioValues,
      borderColor: dataset.color || ASSET_COLORS[index % ASSET_COLORS.length],
      backgroundColor: `rgba(${(dataset.color || ASSET_COLORS[index % ASSET_COLORS.length] || 'rgb(37, 99, 235)').replace('rgb(', '').replace(')', '')}, 0.1)`,
      borderWidth: 2,
      tension: 0.1,
      fill: false,
    };
  });

  // Add invested line if requested (using first dataset as reference)
  if (showInvestedLine && datasets.length > 0) {
    const firstDataset = datasets[0];
    if (firstDataset) {
      const investedValuesByDate: { [key: string]: number } = {};
      firstDataset.data.purchases.forEach(purchase => {
        investedValuesByDate[purchase.date] = purchase.cumulativeInvested;
      });

      const investedValues = uniqueDates.map(date => {
        return investedValuesByDate[date] ?? 0;
      });

      chartDatasets.push({
        label: 'Total Invested',
        data: investedValues,
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: false,
        borderDash: [5, 5],
      } as any);
    }
  }

  return { labels: uniqueDates, datasets: chartDatasets };
}

function ChartDisplay({ 
  data, 
  datasets, 
  isLoading = false, 
  title = 'DCA Simulation Results',
  showInvestedLine = true 
}: ChartDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartType | null>(null);

  useEffect(() => {
    // Handle both single data and multiple datasets
    const hasData = (data && data.purchases && data.purchases.length > 0) || 
                   (datasets && datasets.length > 0);
                   
    if (!hasData || !canvasRef.current) {
      return;
    }

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    let chartData;
    
    if (datasets && datasets.length > 0) {
      // Multi-asset chart
      chartData = prepareMultiAssetChartData(datasets, showInvestedLine);
    } else if (data) {
      // Single asset chart (backward compatibility)
      chartData = prepareSingleAssetChartData(data, showInvestedLine);
    } else {
      return;
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    
    if (!ctx || !chartData) {
      return;
    }
    
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                const value = context.parsed.y ?? 0;
                label += '$' + value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + (value as number).toLocaleString();
              },
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="chart-container" data-testid="chart-container">
        <div className="chart-loading">Loading chart...</div>
      </div>
    );
  }

  if (!data || !data.purchases || data.purchases.length === 0) {
    return (
      <div className="chart-container" data-testid="chart-container">
        <div className="chart-empty">No data to display</div>
      </div>
    );
  }

  return (
    <div className="chart-container" data-testid="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-wrapper">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default ChartDisplay;
