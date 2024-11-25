import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import CoinDetails from './pages/CoinDetails';
import Exchanges from './pages/Exchanges';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <RecoilRoot>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/coin/:id" element={<CoinDetails />} />
                <Route path="/exchanges" element={<Exchanges />} />
              </Routes>
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </RecoilRoot>
  );
}

export default App;
