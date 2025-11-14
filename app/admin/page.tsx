'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  UserCheck,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';

interface PlatformStats {
  totalAgents: number;
  activeAgents: number;
  totalRevenue: number;
  monthlyRecurring: number;
  avgRevenuePerAgent: number;
  churnRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalAgents: 24,
    activeAgents: 22,
    totalRevenue: 47800,
    monthlyRecurring: 4600,
    avgRevenuePerAgent: 199,
    churnRate: 8.3
  });

  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">AgentOS Platform Management</p>
            </div>
            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                    timeframe === period
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Agents"
            value={stats.totalAgents.toString()}
            change="+12%"
            icon={<Users className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            title="Active Agents"
            value={stats.activeAgents.toString()}
            change="+8%"
            icon={<UserCheck className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${(stats.monthlyRecurring / 1000).toFixed(1)}K`}
            change="+23%"
            icon={<DollarSign className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Avg Revenue/Agent"
            value={`$${stats.avgRevenuePerAgent}`}
            change="+15%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="indigo"
          />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Revenue by Plan
            </h2>
            <div className="space-y-4">
              <PlanRevenue plan="Enterprise" price={399} count={4} total={1596} color="purple" />
              <PlanRevenue plan="Pro" price={199} count={12} total={2388} color="blue" />
              <PlanRevenue plan="Starter" price={99} count={8} total={792} color="green" />
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total MRR</span>
                <span className="text-2xl font-bold text-purple-600">${stats.monthlyRecurring.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              System Health
            </h2>
            <div className="space-y-4">
              <HealthMetric label="API Response Time" value="142ms" status="good" />
              <HealthMetric label="Uptime" value="99.97%" status="good" />
              <HealthMetric label="Churn Rate" value={`${stats.churnRate}%`} status="warning" />
              <HealthMetric label="Support Tickets" value="3 open" status="good" />
            </div>
          </div>
        </div>

        {/* Agent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Recent Agent Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Agent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Market</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">MRR</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sarah Johnson', plan: 'Enterprise', market: 'Miami', status: 'Active', mrr: 399 },
                  { name: 'Mike Rodriguez', plan: 'Pro', market: 'Tampa', status: 'Active', mrr: 199 },
                  { name: 'Emily Chen', plan: 'Pro', market: 'Orlando', status: 'Active', mrr: 199 },
                  { name: 'David Thompson', plan: 'Starter', market: 'Naples', status: 'Active', mrr: 99 },
                  { name: 'Lisa Martinez', plan: 'Enterprise', market: 'Fort Myers', status: 'Active', mrr: 399 },
                ].map((agent, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{agent.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        agent.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                        agent.plan === 'Pro' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {agent.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{agent.market}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">${agent.mrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-green-600">{change}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PlanRevenue({ 
  plan, 
  price, 
  count, 
  total, 
  color 
}: { 
  plan: string; 
  price: number; 
  count: number; 
  total: number; 
  color: string;
}) {
  const percentage = (total / 4776) * 100;
  const colorClasses = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600'
  }[color];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-semibold text-gray-900">{plan}</span>
          <span className="text-sm text-gray-600 ml-2">({count} agents)</span>
        </div>
        <span className="font-bold text-gray-900">${total.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${colorClasses} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function HealthMetric({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string; 
  status: 'good' | 'warning' | 'error';
}) {
  const statusColor = {
    good: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100'
  }[status];

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700">{label}</span>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
        {value}
      </span>
    </div>
  );
}
