'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import styles from './page.module.css'

// The function to calculate the days to ATH
const getDaysToATH = (currentPrice, ath, ath_change_percentage) => {
  const dailyChange = currentPrice * ath_change_percentage / 100
  const priceDiff = ath - currentPrice
  return Math.ceil(priceDiff / dailyChange)
}

export default function Home() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false')
      .then(response => response.json())
      .then(data => setCoins(data.slice(0, 5))) // Take the first 5 coins
      .catch(error => console.error('Error fetching data:', error))
  }, [])
  
  const normalize = (value, minValue, maxValue) => (value - minValue) / (maxValue - minValue);
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  const minMaxValues = coins.reduce((acc, coin) => ({
    minPriceChange: Math.min(acc.minPriceChange, coin.price_change_percentage_24h),
    maxPriceChange: Math.max(acc.maxPriceChange, coin.price_change_percentage_24h),
    minMarketCap: Math.min(acc.minMarketCap, coin.market_cap),
    maxMarketCap: Math.max(acc.maxMarketCap, coin.market_cap),
    minTotalVolume: Math.min(acc.minTotalVolume, coin.total_volume),
    maxTotalVolume: Math.max(acc.maxTotalVolume, coin.total_volume),
  }), {minPriceChange: Infinity,
    maxPriceChange: -Infinity,
    minMarketCap: Infinity,
    maxMarketCap: -Infinity,
    minTotalVolume: Infinity,
    maxTotalVolume: -Infinity,
  });
  const chartData = coins.map(coin => ({
    name: coin.name,
    'ATH Change Percentage': coin.ath_change_percentage,
    'Price Change Percentage 24h': sigmoid(coin.price_change_percentage_24h),
    'Market Cap': normalize(coin.market_cap, minMaxValues.minMarketCap , minMaxValues.maxMarketCap),
    'Total Volume': normalize(coin.total_volume , minMaxValues.minTotalVolume , minMaxValues.maxTotalVolume ),
  }));

  const tooltipFormatter = (value) => `${value}%`; // Format tooltip value as a percentage

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Top 5 Cryptocurrencies</h1>
        <p className={styles.description}>These are the top 5 cryptocurrencies by market cap.</p>
        <div className={styles.grid}>
          {coins.map((coin) => (
            <div key={coin.id} className={styles.coin}>
              <Image
                src={coin.image}
                alt={coin.name}
                width={100}
                height={100}
              />
              <div>
                <h2>{coin.name}</h2>
                <p>Current price: {coin.current_price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>ATH Change Percentage</h1>
        <p className={styles.description}>This chart shows the percentage change from the all-time high (ATH) for each coin.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <Bar dataKey='ATH Change Percentage' fill='#8884d8' />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>Chart 2: Cryptocurrency Comparison</h1>
        <p className={styles.description}>This radar chart compares different aspects of selected cryptocurrencies.</p>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <Radar name="Price Change Percentage 24h" dataKey="Price Change Percentage 24h" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Market Cap" dataKey="Market Cap" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Radar name="Total Volume" dataKey="Total Volume" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
