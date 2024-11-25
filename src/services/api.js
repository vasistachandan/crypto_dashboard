import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map();

// Rate limiting configuration
let lastRequestTime = 0;
const REQUEST_DELAY = 1100; // 1.1 seconds between requests

// Helper function to handle rate limiting
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
};

// Helper function to get cached data or make API call
const getCachedOrFetch = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  await waitForRateLimit();
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { value: 'inr', label: 'INR' },
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
  { value: 'gbp', label: 'GBP' },
  { value: 'jpy', label: 'JPY' },
  { value: 'aud', label: 'AUD' },
  { value: 'cad', label: 'CAD' },
  { value: 'chf', label: 'CHF' },
  { value: 'cny', label: 'CNY' }
];

// Create the API service
const apiService = {
  getCoins: async function(currency = 'usd', page = 1, perPage = 50) {
    const cacheKey = `coins-${currency}-${page}-${perPage}`;
    
    try {
      return await getCachedOrFetch(cacheKey, async () => {
        const response = await axios.get(`${BASE_URL}/coins/markets`, {
          params: {
            vs_currency: currency.toLowerCase(),
            order: 'market_cap_desc',
            per_page: perPage,
            page: page,
            sparkline: false,
            price_change_percentage: '24h'
          }
        });

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format from API');
        }

        return response.data.map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price || 0,
          market_cap: coin.market_cap || 0,
          market_cap_rank: coin.market_cap_rank || null,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          total_volume: coin.total_volume || 0,
          high_24h: coin.high_24h || 0,
          low_24h: coin.low_24h || 0
        }));
      });
    } catch (error) {
      console.error('Error fetching coins:', error);
      
      if (error.response?.status === 429) {
        // If rate limited, wait and retry once
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getCoins(currency, page, perPage);
      }

      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch coins. Please try again later.'
      );
    }
  },

  getExchanges: async function(page = 1, perPage = 50) {
    const cacheKey = `exchanges-${page}-${perPage}`;
    
    try {
      return await getCachedOrFetch(cacheKey, async () => {
        const response = await axios.get(`${BASE_URL}/exchanges`, {
          params: {
            per_page: perPage,
            page: page
          }
        });

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format from API');
        }

        return response.data.map(exchange => ({
          id: exchange.id,
          name: exchange.name,
          image: exchange.image,
          trust_score: exchange.trust_score || 0,
          trust_score_rank: exchange.trust_score_rank || null,
          trade_volume_24h_btc: exchange.trade_volume_24h_btc || 0,
          trade_volume_24h_btc_normalized: exchange.trade_volume_24h_btc_normalized || 0,
          country: exchange.country || 'N/A',
          year_established: exchange.year_established || null,
          url: exchange.url || '#'
        }));
      });
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      
      if (error.response?.status === 429) {
        // If rate limited, wait and retry once
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getExchanges(page, perPage);
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch exchanges. Please try again later.'
      );
    }
  },

  getCoinDetails: async function(id, currency = 'usd') {
    const cacheKey = `coin-details-${id}-${currency}`;
    
    try {
      return await getCachedOrFetch(cacheKey, async () => {
        const [details, history] = await Promise.all([
          axios.get(`${BASE_URL}/coins/${id}`, {
            params: {
              localization: false,
              tickers: false,
              market_data: true,
              community_data: false,
              developer_data: false,
              sparkline: false
            }
          }),
          axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
            params: {
              vs_currency: currency.toLowerCase(),
              days: '7',
              interval: 'daily'
            }
          })
        ]);

        if (!details.data || !history.data || !history.data.prices) {
          throw new Error('Invalid response format from API');
        }

        const { data } = details;
        if (!data.id || !data.name || !data.symbol || !data.market_data) {
          throw new Error('Missing required coin data fields');
        }

        return {
          id: data.id,
          name: data.name,
          symbol: data.symbol,
          image: data.image?.large || '',
          description: data.description?.en || '',
          market_data: {
            current_price: data.market_data.current_price || {},
            market_cap: data.market_data.market_cap || {},
            total_volume: data.market_data.total_volume || {},
            high_24h: data.market_data.high_24h || {},
            low_24h: data.market_data.low_24h || {},
            price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
            market_cap_rank: data.market_data.market_cap_rank || null,
            price_change_percentage_7d: data.market_data.price_change_percentage_7d || 0,
            price_change_percentage_30d: data.market_data.price_change_percentage_30d || 0,
            circulating_supply: data.market_data.circulating_supply || null,
            total_supply: data.market_data.total_supply || null
          },
          priceHistory: history.data.prices || []
        };
      });
    } catch (error) {
      console.error('Error fetching coin details:', error);
      
      if (error.response?.status === 429) {
        // If rate limited, wait and retry once
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getCoinDetails(id, currency);
      }

      if (error.response?.status === 404) {
        throw new Error(`Cryptocurrency with ID "${id}" not found`);
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch coin details. Please try again later.'
      );
    }
  },

  getCoinHistory: async function(id, currency = 'usd', days = 7) {
    const cacheKey = `coin-history-${id}-${currency}-${days}`;
    
    try {
      return await getCachedOrFetch(cacheKey, async () => {
        const response = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
          params: {
            vs_currency: currency.toLowerCase(),
            days: days,
            interval: days > 30 ? 'daily' : 'hourly'
          }
        });

        if (!response.data || !response.data.prices) {
          throw new Error('Invalid response format from API');
        }

        return {
          prices: response.data.prices.map(([timestamp, price]) => ({
            x: new Date(timestamp),
            y: price
          }))
        };
      });
    } catch (error) {
      if (error.response?.status === 429) {
        // If rate limited, wait and retry once
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getCoinHistory(id, currency, days);
      }
      console.error('Error fetching coin history:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch coin history');
    }
  }
};

// Export the API service
export const api = apiService;
