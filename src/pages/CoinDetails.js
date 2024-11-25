import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, SUPPORTED_CURRENCIES } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ReactApexChart from 'react-apexcharts';

const CoinDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [timeRange, setTimeRange] = useState('7');

  // Memoize chart options to prevent unnecessary re-renders
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'area',
      height: 350,
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    grid: {
      show: false
    },
    tooltip: {
      theme: 'dark'
    },
    xaxis: {
      type: 'datetime'
    }
  }), []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await api.getCoinDetails(id, selectedCurrency);
        
        if (!isMounted) return;
        
        // Validate the response data
        if (!result || !result.id || !result.name || !result.market_data || !result.priceHistory) {
          throw new Error('Invalid data received from server');
        }
        
        setData(result);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error in CoinDetails:', err);
        setError(err.message || 'Failed to fetch coin details');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, selectedCurrency]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 dark:bg-gray-900">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-red-700 dark:text-red-400">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const series = [{
    name: 'Price',
    data: data.priceHistory.map(point => ({
      x: new Date(point[0]),
      y: point[1]
    }))
  }];

  return (
    <div className="min-h-screen p-4 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <img src={data.image} alt={data.name} className="w-16 h-16 rounded-full mr-4" />
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{data.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{data.symbol?.toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Price</span>
                <span className="font-semibold dark:text-white">
                  ${data.market_data.current_price[selectedCurrency]?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
                <span className="font-semibold dark:text-white">
                  ${data.market_data.market_cap[selectedCurrency]?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">24h Change</span>
                <span className={`font-semibold ${
                  data.market_data.price_change_percentage_24h >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {data.market_data.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">24h High</span>
                <span className="font-semibold dark:text-white">
                  ${data.market_data.high_24h[selectedCurrency]?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">24h Low</span>
                <span className="font-semibold dark:text-white">
                  ${data.market_data.low_24h[selectedCurrency]?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Market Cap Rank</span>
                <span className="font-semibold dark:text-white">#{data.market_data.market_cap_rank}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Price Chart</h2>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {SUPPORTED_CURRENCIES.map(currency => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>
            <ReactApexChart 
              options={chartOptions}
              series={series}
              type="area"
              height={350}
            />
          </div>

          {data.description && (
            <div>
              <h2 className="text-xl font-semibold mb-2 dark:text-white">About {data.name}</h2>
              <div 
                className="text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinDetails;
