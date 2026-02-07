import { CryptoPrices, NetworkStats } from "@/types/mining";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const MEMPOOL_API = "https://mempool.space/api/v1";

// Cache for API responses
let priceCache: { data: CryptoPrices; timestamp: number } | null = null;
let networkCache: { data: NetworkStats; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Fetch cryptocurrency prices from CoinGecko
 */
export async function getCryptoPrices(): Promise<CryptoPrices> {
  // Check cache
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
    return priceCache.data;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin,litecoin,ravencoin,ergo,zelcash&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    const prices: CryptoPrices = {
      bitcoin: data.bitcoin?.usd || 67000,
      litecoin: data.litecoin?.usd || 85,
      ravencoin: data.ravencoin?.usd || 0.025,
      ergo: data.ergo?.usd || 1.5,
      flux: data.zelcash?.usd || 0.5,
      lastUpdated: new Date(),
    };

    // Update cache
    priceCache = { data: prices, timestamp: Date.now() };

    return prices;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    // Return fallback prices
    return {
      bitcoin: 67000,
      litecoin: 85,
      ravencoin: 0.025,
      ergo: 1.5,
      flux: 0.5,
      lastUpdated: new Date(),
    };
  }
}

/**
 * Fetch Bitcoin network statistics from Mempool.space
 */
export async function getNetworkStats(): Promise<NetworkStats> {
  // Check cache
  if (networkCache && Date.now() - networkCache.timestamp < CACHE_TTL) {
    return networkCache.data;
  }

  try {
    // Fetch difficulty adjustment info
    const diffResponse = await fetch(`${MEMPOOL_API}/difficulty-adjustment`);
    const hashResponse = await fetch(`${MEMPOOL_API}/mining/hashrate/1m`);

    if (!diffResponse.ok || !hashResponse.ok) {
      throw new Error("Mempool API error");
    }

    const diffData = await diffResponse.json();
    const hashData = await hashResponse.json();

    // Get current hashrate (last entry)
    const currentHashrate =
      hashData.hashrates?.[hashData.hashrates.length - 1]?.avgHashrate || 0;

    const stats: NetworkStats = {
      networkHashrateEh: currentHashrate / 1e18, // Convert to exahash
      difficulty: diffData.previousDifficulty || 88e12,
      blockReward: 3.125, // Post-2024 halving
      avgBlockTimeSeconds: diffData.timeAvg || 600,
      nextDifficultyAdjustmentPercent: diffData.difficultyChange || 0,
    };

    // Update cache
    networkCache = { data: stats, timestamp: Date.now() };

    return stats;
  } catch (error) {
    console.error("Error fetching network stats:", error);
    // Return fallback stats
    return {
      networkHashrateEh: 600, // ~600 EH/s as of 2024
      difficulty: 88e12,
      blockReward: 3.125,
      avgBlockTimeSeconds: 600,
      nextDifficultyAdjustmentPercent: 0,
    };
  }
}

/**
 * Get price for a specific coin by symbol
 */
export function getPriceBySymbol(
  prices: CryptoPrices,
  symbol: string
): number {
  const priceMap: Record<string, number> = {
    BTC: prices.bitcoin,
    LTC: prices.litecoin,
    RVN: prices.ravencoin,
    ERG: prices.ergo,
    FLUX: prices.flux,
  };
  return priceMap[symbol] || 0;
}

/**
 * Format large numbers for display
 */
export function formatHashrate(hashrateTh: number): string {
  if (hashrateTh >= 1000000) {
    return `${(hashrateTh / 1000000).toFixed(2)} EH/s`;
  } else if (hashrateTh >= 1000) {
    return `${(hashrateTh / 1000).toFixed(2)} PH/s`;
  } else {
    return `${hashrateTh.toFixed(2)} TH/s`;
  }
}

/**
 * Calculate daily BTC revenue based on hashrate and network stats
 */
export function calculateDailyBtcRevenue(
  minerHashrateTh: number,
  networkStats: NetworkStats,
  poolFeePercent: number
): { gross: number; net: number } {
  // Network hashrate in TH/s
  const networkHashrateTh = networkStats.networkHashrateEh * 1e6;

  // Miner's share of network
  const minerShare = minerHashrateTh / networkHashrateTh;

  // Blocks per day
  const blocksPerDay = 86400 / networkStats.avgBlockTimeSeconds;

  // Daily BTC produced by network
  const dailyBtcNetwork = blocksPerDay * networkStats.blockReward;

  // Miner's gross daily BTC
  const dailyBtcGross = dailyBtcNetwork * minerShare;

  // After pool fee
  const dailyBtcNet = dailyBtcGross * (1 - poolFeePercent / 100);

  return {
    gross: dailyBtcGross,
    net: dailyBtcNet,
  };
}
