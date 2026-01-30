import React from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { WalletProvider } from './context/WalletContext'
import { ContractProvider } from './context/ContractContext'
import './App.css'

function App() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <h1>Stakied Protocol</h1>
            <p>Decentralized Yield Trading on Stacks</p>
          </main>
          <Footer />
        </div>
      </ContractProvider>
    </WalletProvider>
  )
}

export default App
