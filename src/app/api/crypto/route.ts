import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const MEMPOOL_API = "https://mempool.space/api/v1";

interface PricesData {
  bitcoin: number;
  litecoin: number;
  ravencoin: number;
  ergo: number;
  flux: number;
  lastUpdated: string;
  source: string;
}

interface NetworkData {
  networkHashrateEh: number;
  difficulty: number;
  blockReward: number;
  avgBlockTimeSeconds: number;
  nextDifficultyAdjustmentPercent: number;
  lastUpdated: string;
  source: string;
}

// Cache storage
let cache: {
  prices?: { data: PricesData; timestamp: number };
  network?: { data: NetworkData; timestamp: number };
} = {};

const CACHE_TTL = 60000; // 1 minute

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "prices";

  try {
    if (type === "prices") {
      return await getPrices();
    } else if (type === "network") {
      return await getNetworkStats();
    } else if (type === "all") {
      const [pricesRes, networkRes] = await Promise.all([
        getPricesData(),
        getNetworkData(),
      ]);
      return NextResponse.json({
        prices: pricesRes,
        network: networkRes,
        source: "api",
      });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("Crypto API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 }
    );
  }
}

async function getPrices() {
  const data = await getPricesData();
  return NextResponse.json(data);
}

async function getPricesData(): Promise<PricesData> {
  // Check cache
  if (cache.prices && Date.now() - cache.prices.timestamp < CACHE_TTL) {
    return { ...cache.prices.data, source: "cache" as const };
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin,litecoin,ravencoin,ergo,zelcash&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`);
    }

    const data = await response.json();

    const prices = {
      bitcoin: data.bitcoin?.usd || 67000,
      litecoin: data.litecoin?.usd || 85,
      ravencoin: data.ravencoin?.usd || 0.025,
      ergo: data.ergo?.usd || 1.5,
      flux: data.zelcash?.usd || 0.5,
      lastUpdated: new Date().toISOString(),
      source: "coingecko",
    };

    cache.prices = { data: prices, timestamp: Date.now() };

    return prices;
  } catch (error) {
    console.error("CoinGecko fetch error:", error);
    // Return fallback prices
    return {
      bitcoin: 67000,
      litecoin: 85,
      ravencoin: 0.025,
      ergo: 1.5,
      flux: 0.5,
      lastUpdated: new Date().toISOString(),
      source: "fallback",
    };
  }
}

async function getNetworkStats() {
  const data = await getNetworkData();
  return NextResponse.json(data);
}

async function getNetworkData(): Promise<NetworkData> {
  // Check cache
  if (cache.network && Date.now() - cache.network.timestamp < CACHE_TTL) {
    return { ...cache.network.data, source: "cache" as const };
  }

  try {
    const [diffResponse, hashResponse] = await Promise.all([
      fetch(`${MEMPOOL_API}/difficulty-adjustment`, { next: { revalidate: 60 } }),
      fetch(`${MEMPOOL_API}/mining/hashrate/1m`, { next: { revalidate: 60 } }),
    ]);

    if (!diffResponse.ok || !hashResponse.ok) {
      throw new Error("Mempool API error");
    }

    const [diffData, hashData] = await Promise.all([
      diffResponse.json(),
      hashResponse.json(),
    ]);

    // Get current hashrate (last entry)
    const currentHashrate =
      hashData.hashrates?.[hashData.hashrates.length - 1]?.avgHashrate || 0;

    const network = {
      networkHashrateEh: currentHashrate / 1e18,
      difficulty: diffData.previousDifficulty || 88e12,
      blockReward: 3.125,
      avgBlockTimeSeconds: diffData.timeAvg || 600,
      nextDifficultyAdjustmentPercent: diffData.difficultyChange || 0,
      lastUpdated: new Date().toISOString(),
      source: "mempool",
    };

    cache.network = { data: network, timestamp: Date.now() };

    return network;
  } catch (error) {
    console.error("Mempool fetch error:", error);
    // Return fallback stats
    return {
      networkHashrateEh: 600,
      difficulty: 88e12,
      blockReward: 3.125,
      avgBlockTimeSeconds: 600,
      nextDifficultyAdjustmentPercent: 0,
      lastUpdated: new Date().toISOString(),
      source: "fallback",
    };
  }
}
