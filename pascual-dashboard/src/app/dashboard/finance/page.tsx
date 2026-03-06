"use client";

import { PageHeader, Section, SectionHeader, Grid } from "@/components/layout/MainContent";
import { Card, CardHeader, CardBody, CardFooter, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LineChart, Sparkline } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/CircularProgress";

const portfolioData = [
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

const assetAllocation = [
  { name: "Stocks", value: 45, color: "#00d9ff" },
  { name: "Crypto", value: 25, color: "#ff006e" },
  { name: "Bonds", value: 20, color: "#39ff14" },
  { name: "Cash", value: 10, color: "#ffaa00" },
];

const holdings = [
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

const recommendations = [
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

const news = [
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

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Overview"
        description="Portfolio management and market insights"
      />

      {/* Portfolio Stats */}
      <Section>
        <Grid cols={4}>
          <StatCard
            title="Total Value"
            value="$15,200"
            trend={{ value: 52, positive: true }}
            variant="success"
            icon={<span className="text-lg">◈</span>}
          />
          <StatCard
            title="Today's Change"
            value="+$180"
            trend={{ value: 1.2, positive: true }}
            variant="info"
            icon={<span className="text-lg">↑</span>}
          />
          <StatCard
            title="Monthly Return"
            value="8.5%"
            variant="success"
            icon={<span className="text-lg">◎</span>}
          />
          <StatCard
            title="YTD Return"
            value="52%"
            variant="success"
            icon={<span className="text-lg">⟨⟩</span>}
          />
        </Grid>
      </Section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts and Holdings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Performance */}
          <Section>
            <SectionHeader title="Portfolio Performance (12M)" />
            <Card>
              <CardBody>
                <LineChart
                  data={portfolioData}
                  height={250}
                  color="#39ff14"
                />
              </CardBody>
            </Card>
          </Section>

          {/* Holdings */}
          <Section>
            <SectionHeader
              title="Holdings"
              action={
                <button className="text-xs font-mono text-[#00d9ff] hover:text-white transition-colors">
                  View All
                </button>
              }
            />
            <div className="space-y-2">
              {holdings.map((holding) => (
                <Card key={holding.symbol}>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-mono font-bold text-white">
                            {holding.symbol}
                          </p>
                          <p className="font-mono text-xs text-zinc-500">
                            {holding.name}
                          </p>
                        </div>
                      </div>
                      <div className="w-24 h-8">
                        <Sparkline
                          data={holding.history}
                          color={holding.positive ? "#39ff14" : "#ff006e"}
                          height={32}
                        />
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-white">
                          ${holding.value.toFixed(2)}
                        </p>
                        <p
                          className={`font-mono text-xs ${
                            holding.positive ? "text-[#39ff14]" : "text-[#ff006e]"
                          }`}
                        >
                          {holding.positive ? "+" : ""}{holding.change}%
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Section>

          {/* AI Recommendations */}
          <Section>
            <SectionHeader title="AI Recommendations" />
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            rec.type === "buy"
                              ? "success"
                              : rec.type === "sell"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {rec.type.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-mono font-bold text-white">
                            {rec.asset}
                          </p>
                          <p className="font-mono text-xs text-zinc-500">
                            {rec.reason}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-[#00d9ff]">
                          {rec.confidence}% confidence
                        </p>
                        <p className="font-mono text-xs text-zinc-600">
                          {rec.timestamp}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Section>
        </div>

        {/* Right: Allocation and News */}
        <div className="space-y-6">
          {/* Asset Allocation */}
          <Section>
            <SectionHeader title="Asset Allocation" />
            <Card>
              <CardBody className="flex flex-col items-center py-6">
                <DonutChart
                  data={assetAllocation}
                  size={180}
                  strokeWidth={30}
                  centerValue="$15.2K"
                  centerLabel="Total"
                />
                <div className="mt-4 w-full space-y-2">
                  {assetAllocation.map((asset) => (
                    <div
                      key={asset.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: asset.color }}
                        />
                        <span className="font-mono text-sm text-zinc-300">
                          {asset.name}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-white">
                        {asset.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Section>

          {/* Market News */}
          <Section>
            <SectionHeader title="Market News" />
            <Card>
              <CardBody className="p-0">
                <div className="divide-y divide-zinc-800">
                  {news.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-lg ${
                            item.impact === "positive"
                              ? "text-[#39ff14]"
                              : item.impact === "negative"
                                ? "text-[#ff006e]"
                                : "text-zinc-500"
                          }`}
                        >
                          {item.impact === "positive"
                            ? "↑"
                            : item.impact === "negative"
                              ? "↓"
                              : "→"}
                        </span>
                        <div className="flex-1">
                          <p className="font-mono text-sm text-white">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs text-zinc-500">
                              {item.source}
                            </span>
                            <span className="font-mono text-xs text-zinc-600">
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter className="justify-center">
                <button className="text-xs font-mono text-[#00d9ff] hover:text-white transition-colors">
                  View all news
                </button>
              </CardFooter>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}
