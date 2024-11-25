import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Exchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const perPage = 50;

  useEffect(() => {
    let isMounted = true;

    const fetchExchanges = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getExchanges(page, perPage);
        if (isMounted && Array.isArray(data)) {
          setExchanges(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch exchanges');
          console.error('Error fetching exchanges:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExchanges();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const filteredExchanges = exchanges.filter(exchange =>
    exchange.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatVolume = (volume) => {
    if (!volume) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(volume);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search exchanges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-lg border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExchanges.map((exchange) => (
            <a
              key={exchange.id}
              href={exchange.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <img src={exchange.image} alt={exchange.name} className="w-12 h-12" />
                <div>
                  <h2 className="font-semibold text-lg dark:text-white">{exchange.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">Rank #{exchange.trust_score_rank}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Trust Score:</span>
                  <span className="font-medium dark:text-white">{exchange.trust_score}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">24h Volume (BTC):</span>
                  <span className="font-medium dark:text-white">₿{formatVolume(exchange.trade_volume_24h_btc)}</span>
                </div>
                {exchange.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Country:</span>
                    <span className="font-medium dark:text-white">{exchange.country}</span>
                  </div>
                )}
                {exchange.year_established && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Established:</span>
                    <span className="font-medium dark:text-white">{exchange.year_established}</span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded dark:text-white">
            Page {page}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Exchanges;
