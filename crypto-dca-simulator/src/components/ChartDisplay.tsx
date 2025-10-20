/**
 * ChartDisplay Component
 * Wraps Chart.js to display DCA simulation results
 */

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Chart as ChartType } from 'chart.js/auto';
import type { DCAResults } from '../services/dcaCalculator';
import './chart.css';

export interface ChartDisplayProps {
  data: DCAResults | null;
  isLoading?: boolean;
  title?: string;
}

function ChartDisplay({ data, isLoading = false, title = 'DCA Simulation Results' }: ChartDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartType | null>(null);

  useEffect(() => {
    if (!data || !data.purchases || data.purchases.length === 0) {
      return;
    }

    if (!canvasRef.current) {
      return;
    }

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Prepare chart data
    const labels = data.purchases.map((p) => p.date);
    const portfolioValues = data.purchases.map((p) => p.runningTotal);
    const investedValues = data.purchases.map((p) => p.runningInvested ?? 0);

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    
    if (!ctx) {
      return;
    }
    
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Portfolio Value',
            data: portfolioValues,
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true,
          },
          {
            label: 'Total Invested',
            data: investedValues,
            borderColor: 'rgb(156, 163, 175)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: false,
            borderDash: [5, 5],
          },
        ],
      },
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
