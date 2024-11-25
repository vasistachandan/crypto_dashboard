import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableCoins, setAvailableCoins] = useState([]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const coins = await api.getCoins('USD', 1, 100);
        setAvailableCoins(coins);
      } catch (err) {
        console.error('Error fetching coins:', err);
      }
    };
    fetchCoins();
  }, []);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const fromCoinData = availableCoins.find(coin => coin.symbol.toUpperCase() === fromCurrency.toUpperCase());
      const toCoinData = availableCoins.find(coin => coin.symbol.toUpperCase() === toCurrency.toUpperCase());
      
      let convertedAmount;
      if (toCurrency === 'USD') {
        convertedAmount = amount * fromCoinData.current_price;
      } else if (fromCurrency === 'USD') {
        convertedAmount = amount / toCoinData.current_price;
      } else {
        const fromInUSD = amount * fromCoinData.current_price;
        convertedAmount = fromInUSD / toCoinData.current_price;
      }
      
      setResult(convertedAmount);
    } catch (err) {
      setError('Error converting currency. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Currency Converter</h2>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value)) || 0)}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="USD">USD</option>
              {availableCoins.map(coin => (
                <option key={coin.id} value={coin.symbol.toUpperCase()}>
                  {coin.symbol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="USD">USD</option>
              {availableCoins.map(coin => (
                <option key={coin.id} value={coin.symbol.toUpperCase()}>
                  {coin.symbol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        {result !== null && !error && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-lg font-semibold dark:text-white">
              {amount} {fromCurrency} = {result.toFixed(8)} {toCurrency}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
