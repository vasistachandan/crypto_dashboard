import { atom } from 'recoil';

export const coinsState = atom({
  key: 'coinsState',
  default: []
});

export const favoritesState = atom({
  key: 'favoritesState',
  default: (() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  })()
});

export const currencyState = atom({
  key: 'currencyState',
  default: 'USD'
});

export const searchQueryState = atom({
  key: 'searchQueryState',
  default: ''
});

export const sortConfigState = atom({
  key: 'sortConfigState',
  default: {
    key: 'market_cap',
    direction: 'desc'
  }
});

export const pageState = atom({
  key: 'pageState',
  default: 1
});
