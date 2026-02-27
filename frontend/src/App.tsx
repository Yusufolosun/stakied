import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WalletProvider } from './context/WalletContext';
import { ContractProvider } from './context/ContractContext';

// Pages
import { Home } from './pages/Home';
import { Swap } from './pages/Swap';
import { Deposit } from './pages/Deposit';
import { Mint } from './pages/Mint';
import { Redeem } from './pages/Redeem';
import { Pool } from './pages/Pool';
import { Analytics } from './pages/Analytics';
import { Docs } from './pages/Docs';

import './App.css';

function App() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="flex flex-col min-h-screen bg-color-bg-space selection:bg-primary/30 selection:text-white">
          <Header />

          <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/redeem" element={<Redeem />} />
              <Route path="/pool" element={<Pool />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/docs" element={<Docs />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}

export default App;
