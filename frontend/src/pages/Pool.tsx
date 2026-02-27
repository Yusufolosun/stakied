import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { GradientText } from '../components/common/GradientText';
import { usePool } from '../hooks/usePool';
import { useWallet } from '../hooks/useWallet';

export const Pool: React.FC = () => {
  const { address } = useWallet();
  const { stakedBalance, stake, unstake, claimRewards, isLoading, error } = usePool(address);

  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');

  const poolStats = [
    { label: 'Total Liquidity', value: '$8.4M' },
    { label: 'Volume (24h)', value: '$1.2M' },
    { label: 'Fees (24h)', value: '$3.4K' },
    { label: 'Net APY', value: '12.4%', highlight: true },
  ];

  const handleAction = async () => {
    if (!amount) return;
    const val = BigInt(Math.floor(parseFloat(amount) * 1e6));
    if (activeTab === 'stake') {
      await stake(val);
    } else {
      await unstake(val);
    }
    setAmount('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-reveal">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display"><GradientText>Liquidity & Staking</GradientText></h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Provide liquidity to the PT-SY AMM and earn trading fees plus protocol rewards.
          Stake your LP tokens to maximize your yield.
        </p>
      </div>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {poolStats.map((stat) => (
          <Card key={stat.label} variant="glass" className="p-1 px-6 py-4">
            <p className="text-[10px] text-text-dim uppercase font-bold mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-display mb-0 ${stat.highlight ? 'text-primary' : 'text-main'}`}>
              {stat.value}
            </h3>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Management Card */}
        <Card className="lg:col-span-3 p-2">
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab('stake')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'stake' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-main'}`}
            >
              Add Liquidity
            </button>
            <button
              onClick={() => setActiveTab('unstake')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'unstake' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-main'}`}
            >
              Remove Liquidity
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider">
                <span>Enter Amount</span>
                <span>Balance: 0.00 LP</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none text-4xl font-display font-bold text-main w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="glass-panel px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                  PT-SY LP
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-dim">Est. Pool Share</span>
                <span className="text-text-main font-medium">0.05%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-dim">Base APY</span>
                <span className="text-text-main font-medium">8.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-dim">Boost Rewards</span>
                <span className="text-primary font-bold">+4.2%</span>
              </div>
            </div>

            {error && <p className="text-error text-sm text-center font-medium">{error}</p>}

            <Button
              onClick={handleAction}
              isLoading={isLoading}
              className="w-full py-5 text-xl shadow-glow"
            >
              {activeTab === 'stake' ? 'Confirm Addition' : 'Confirm Removal'}
            </Button>
          </div>
        </Card>

        {/* Rewards Card */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Pending Rewards" variant="solid" className="bg-grad-primary/10 border-primary/20">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-text-dim uppercase font-bold mb-1">Stakied Rewards</p>
                  <h4 className="text-3xl font-display text-main mb-0">12,450 SKD</h4>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
                  💎
                </div>
              </div>
              <Button onClick={claimRewards} variant="glass" className="w-full bg-white/5 hover:bg-white/10">
                Claim All Rewards
              </Button>
            </div>
          </Card>

          <Card title="Your Position" interactive={false}>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Staked</span>
                <span className="text-main font-bold">{(Number(stakedBalance) / 1e6).toFixed(2)} LP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Value (USD)</span>
                <span className="text-main font-bold">$12,450.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Monthly Earnings</span>
                <span className="text-success font-bold">+$124.50</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
