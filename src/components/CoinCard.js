import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { favoritesState } from '../atoms/cryptoAtoms';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const getCurrencySymbol = (currency) => {
  const symbols = {
    usd: '$',
    eur: '€',
    gbp: '£',
    jpy: '¥',
    aud: 'A$',
    cad: 'C$',
    chf: 'Fr',
    cny: '¥'
  };
  return symbols[currency.toLowerCase()] || currency.toUpperCase();
};

const formatPrice = (price, currency) => {
  if (!price && price !== 0) return 'N/A';
  
  const symbol = getCurrencySymbol(currency);
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
  
  return `${symbol}${formatter.format(price)}`;
};

const formatMarketCap = (marketCap, currency) => {
  if (!marketCap && marketCap !== 0) return 'N/A';
  
  const symbol = getCurrencySymbol(currency);
  const value = marketCap;
  
  if (value >= 1e12) return `${symbol}${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${symbol}${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${symbol}${(value / 1e3).toFixed(2)}K`;
  
  return `${symbol}${value.toFixed(2)}`;
};

const formatPercentage = (percentage) => {
  if (!percentage && percentage !== 0) return 'N/A';
  return `${percentage.toFixed(2)}%`;
};

const CoinCard = ({ coin, currency = 'usd' }) => {
  const setFavorites = useSetRecoilState(favoritesState);
  const favorites = useRecoilValue(favoritesState);
  const isFavorite = favorites.includes(coin?.id);

  const toggleFavorite = (e) => {
    e.preventDefault();
    if (!coin?.id) return;
    
    setFavorites(prev => {
      const newFavorites = isFavorite
        ? prev.filter(id => id !== coin.id)
        : [...prev, coin.id];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  if (!coin || !coin.id) {
    return null;
  }

  return (
    <Link 
      to={`/coin/${coin.id}`} 
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {coin.image && (
            <img 
              src={coin.image} 
              alt={coin.name} 
              className="w-8 h-8"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/fallback-coin-image.png';
              }}
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {coin.name || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
              {coin.symbol || '---'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleFavorite}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          {isFavorite ? (
            <StarIconSolid className="h-5 w-5 text-yellow-500" />
          ) : (
            <StarIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
          )}
        </button>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(coin.current_price, currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">24h Change</span>
          <span className={`font-medium ${
            (coin.price_change_percentage_24h || 0) >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatPercentage(coin.price_change_percentage_24h)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatMarketCap(coin.market_cap, currency)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CoinCard;
