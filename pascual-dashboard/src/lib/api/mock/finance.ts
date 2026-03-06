// Portfolio performance data
export const mockPortfolioData = [
  { name: "Jan", value: 10000 },
  { name: "Feb", value: 10500 },
  { name: "Mar", value: 10200 },
  { name: "Apr", value: 11200 },
  { name: "May", value: 12100 },
  { name: "Jun", value: 11800 },
  { name: "Jul", value: 12500 },
  { name: "Aug", value: 13200 },
  { name: "Sep", value: 12900 },
  { name: "Oct", value: 14100 },
  { name: "Nov", value: 14800 },
  { name: "Dec", value: 15200 },
];

// Asset allocation
export const mockAssetAllocation = [
  { name: "Stocks", value: 45, color: "#00d9ff" },
  { name: "Crypto", value: 25, color: "#ff006e" },
  { name: "Bonds", value: 20, color: "#39ff14" },
  { name: "Cash", value: 10, color: "#ffaa00" },
];

// Portfolio stats
export const mockPortfolioStats = {
  totalValue: 15200,
  todayChange: 180,
  todayChangePercent: 1.2,
  monthlyReturn: 8.5,
  ytdReturn: 52,
};

// Holdings
export interface Holding {
  symbol: string;
  name: string;
  value: number;
  change: number;
  positive: boolean;
  history: number[];
}

export const mockHoldings: Holding[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    value: 4250.00,
    change: 3.2,
    positive: true,
    history: [100, 105, 102, 108, 115, 112, 118],
  },
  {
    symbol: "AAPL",
    name: "Apple Inc",
    value: 2180.50,
    change: 1.5,
    positive: true,
    history: [90, 92, 91, 94, 93, 95, 96],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    value: 3750.00,
    change: -2.1,
    positive: false,
    history: [110, 108, 112, 105, 102, 98, 95],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    value: 1250.00,
    change: -0.8,
    positive: false,
    history: [85, 88, 86, 84, 82, 80, 78],
  },
];

// AI Recommendations
export interface Recommendation {
  id: string;
  type: "buy" | "hold" | "sell";
  asset: string;
  reason: string;
  confidence: number;
  timestamp: string;
}

export const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    type: "buy",
    asset: "MSFT",
    reason: "Strong Q4 earnings outlook",
    confidence: 85,
    timestamp: "2h ago",
  },
  {
    id: "2",
    type: "hold",
    asset: "NVDA",
    reason: "Wait for market correction",
    confidence: 72,
    timestamp: "5h ago",
  },
  {
    id: "3",
    type: "sell",
    asset: "META",
    reason: "Overvalued relative to peers",
    confidence: 68,
    timestamp: "1d ago",
  },
];

// Market news
export interface MarketNews {
  id: string;
  title: string;
  source: string;
  impact: "positive" | "negative" | "neutral";
  timestamp: string;
}

export const mockMarketNews: MarketNews[] = [
  {
    id: "1",
    title: "Fed signals potential rate cuts in 2025",
    source: "Reuters",
    impact: "positive",
    timestamp: "30m ago",
  },
  {
    id: "2",
    title: "Tech sector leads market gains",
    source: "Bloomberg",
    impact: "positive",
    timestamp: "2h ago",
  },
  {
    id: "3",
    title: "Cryptocurrency volatility increases",
    source: "CoinDesk",
    impact: "negative",
    timestamp: "4h ago",
  },
  {
    id: "4",
    title: "Global supply chain improvements expected",
    source: "WSJ",
    impact: "neutral",
    timestamp: "6h ago",
  },
];
