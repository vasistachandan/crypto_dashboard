import React, { useState, useEffect, useMemo } from 'react';
import { api, SUPPORTED_CURRENCIES } from '../services/api';
import CoinCard from '../components/CoinCard';

const Home = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('usd');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('default');
  const perPage = 50;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getCoins(currency, page, perPage);
        if (isMounted && Array.isArray(data)) {
          setCoins(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch coins');
          console.error('Error fetching coins:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCoins();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [currency, page, perPage]);

  const filteredAndSortedCoins = useMemo(() => {
    let result = coins;
    
    // First apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm) ||
        coin.symbol.toLowerCase().includes(searchTerm)
      );
    }
    
    // Then apply sorting
    if (sortOrder !== 'default') {
      result = [...result].sort((a, b) => {
        if (sortOrder === 'price_asc') {
          return a.current_price - b.current_price;
        } else if (sortOrder === 'price_desc') {
          return b.current_price - a.current_price;
        }
        return 0;
      });
    }
    
    return result;
  }, [coins, search, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cryptocurrency Prices
          </h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search coins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow sm:flex-grow-0 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="default">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {SUPPORTED_CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCoins.map(coin => (
            <CoinCard key={coin.id} coin={coin} currency={currency} />
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
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

export default Home;
