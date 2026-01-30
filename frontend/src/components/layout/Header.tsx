import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Stakied Protocol</h1>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/deposit">Deposit</a>
          <a href="/mint">Mint</a>
        </nav>
        <button className="connect-wallet-btn">
          Connect Wallet
        </button>
      </div>
    </header>
  );
};
