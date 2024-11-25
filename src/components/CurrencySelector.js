import React from 'react';
import { useRecoilState } from 'recoil';
import { currencyState } from '../atoms/cryptoAtoms';

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'INR', symbol: '₹' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
];

const CurrencySelector = () => {
  const [currency, setCurrency] = useRecoilState(currencyState);

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      {currencies.map(({ code, symbol }) => (
        <option key={code} value={code}>
          {code} ({symbol})
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
