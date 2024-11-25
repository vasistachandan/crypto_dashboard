import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { favoritesState, currencyState } from '../atoms/cryptoAtoms';
import { api } from '../services/api';
import CoinCard from '../components/CoinCard';

const Favorites = () => {
  const favorites = useRecoilValue(favoritesState);
  const currency = useRecoilValue(currencyState);
  const [favoriteCoins, setFavoriteCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteCoins = async () => {
      if (favorites.length === 0) {
        setFavoriteCoins([]);
        setLoading(false);
        return;
      }

      try {
        const data = await api.getCoins(currency);
        const filteredCoins = data.filter(coin => favorites.includes(coin.id));
        setFavoriteCoins(filteredCoins);
      } catch (error) {
        console.error('Error fetching favorite coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteCoins();
  }, [favorites, currency]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          No Favorites Yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Add cryptocurrencies to your favorites by clicking the star icon on any coin card.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Your Favorite Cryptocurrencies
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favoriteCoins.map(coin => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
