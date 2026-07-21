import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../../shared/components/Common';
import { ResponsiveContainer, ComposedChart, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FiTrendingUp, FiSliders, FiRefreshCw, FiCpu, FiAlertCircle, FiPieChart, FiActivity, FiAward, FiMessageSquare, FiStar, FiShoppingCart, FiZap } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Analytics() {
  const [modelType, setModelType] = useState('linear');
  const [forecastLength, setForecastLength] = useState(3);
  const [alpha, setAlpha] = useState(0.3);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  // AI Assistant Analytics
  const [aiStats, setAiStats] = useState(null);
  const [aiStatsLoading, setAiStatsLoading] = useState(true);

  const fetchAiStats = async () => {
    setAiStatsLoading(true);
    try {
      const token = localStorage.getItem('mhv_token');
      const res = await fetch(`${API_BASE}/api/assistant/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAiStats(data);
      }
    } catch (err) {
      console.error('Failed to load AI assistant analytics:', err);
    } finally {
      setAiStatsLoading(false);
    }
  };

  useEffect(() => { fetchAiStats(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics', {
        params: {
          modelType,
          forecastLength,
          alpha
        }
      });
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load machine learning analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [modelType, forecastLength]);

  // Handle manual refresh or slider change submit
  const handleApplySmoothing = () => {
    fetchAnalytics();
  };

  // Combine historical and forecasted data for Recharts composed chart
  const getChartData = () => {
    if (!analyticsData) return [];
    
    const combined = [];
    analyticsData.historical.forEach(pt => {
      combined.push({
        month: pt.month,
        revenue: pt.revenue,
        orders: pt.orders,
        forecastedRevenue: null,
        isForecast: false
      });
    });

    analyticsData.forecasted.forEach(pt => {
      combined.push({
        month: pt.month,
        revenue: null,
        orders: null,
        forecastedRevenue: pt.revenue,
        isForecast: true
      });
    });

    return combined;
  };

  const chartData = getChartData();
  const modelStats = analyticsData?.modelStats;
  const aiAnalysis = analyticsData?.aiAnalysis;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Business Analytics</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase">Machine Learning Revenue Forecasting & AI Assistant Insights</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => { fetchAnalytics(); fetchAiStats(); }}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold border-gray-200"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </Button>
      </div>

      {/* ===== AI Assistant Analytics Section ===== */}
      <div className="border border-gray-100 rounded-large p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-50">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <FiMessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-800">AI Shopping Assistant Analytics</h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Conversation insights, recommendation performance & satisfaction</p>
          </div>
          <button onClick={fetchAiStats} className="ml-auto p-1.5 hover:bg-gray-50 rounded-large text-gray-400 hover:text-primary transition-colors">
            <FiRefreshCw size={13} className={aiStatsLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {aiStatsLoading ? (
          <div className="h-24 flex items-center justify-center">
            <span className="text-xs text-gray-400 font-semibold animate-pulse">Loading AI insights...</span>
          </div>
        ) : !aiStats ? (
          <p className="text-xs text-gray-400 font-semibold text-center py-6">No AI assistant data available yet. Start conversations to generate insights.</p>
        ) : (
          <>
            {/* KPI Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-large">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiZap size={12} className="text-amber-600" />
                  <span className="text-[9px] font-black text-amber-700 uppercase">Conversion Rate</span>
                </div>
                <p className="text-2xl font-black text-amber-800">{aiStats.conversionRate}%</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-large">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiStar size={12} className="text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase">Avg Satisfaction</span>
                </div>
                <p className="text-2xl font-black text-emerald-800">{Number(aiStats.avgSatisfaction || 0).toFixed(1)} ★</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-large">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiShoppingCart size={12} className="text-blue-600" />
                  <span className="text-[9px] font-black text-blue-700 uppercase">Top Style</span>
                </div>
                <p className="text-sm font-black text-blue-800 truncate">{aiStats.styleStats?.[0]?._id || 'Modern'}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-large">
                <div className="flex items-center gap-1.5 mb-1">
                  <FiMessageSquare size={12} className="text-purple-600" />
                  <span className="text-[9px] font-black text-purple-700 uppercase">Top Query</span>
                </div>
                <p className="text-sm font-black text-purple-800 truncate">{aiStats.faqStats?.[0]?._id || 'sofa match'}</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FAQ Bar Chart */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Frequently Asked Topics</h4>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiStats.faqStats?.slice(0,6).map(f => ({ name: f._id, count: f.count }))} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip formatter={(val) => [`${val} queries`, 'Count']} />
                      <Bar dataKey="count" fill="#A66A2C" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Most Recommended Products */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Most Recommended Products</h4>
                <div className="space-y-2">
                  {(aiStats.recommendedStats || []).slice(0, 5).map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-400 w-4">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-700 truncate">{rec._id}</p>
                        <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, (rec.count / (aiStats.recommendedStats?.[0]?.count || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 flex-shrink-0">{rec.count}x</span>
                    </div>
                  ))}
                  {(!aiStats.recommendedStats || aiStats.recommendedStats.length === 0) && (
                    <p className="text-xs text-gray-400 py-4 text-center">No recommendations recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* ===== End AI Assistant Analytics Section ===== */}

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Forecast Model Selection */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center text-amber-600">
                <FiCpu className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Forecasting Model</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mb-3 leading-relaxed">
              Select the regression algorithm to fit historical sales data.
            </p>
          </div>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-large text-xs font-semibold focus:outline-none"
          >
            <option value="linear">Linear Regression (TrendLine)</option>
            <option value="polynomial">Polynomial Regression (Quadratic Curve)</option>
            <option value="smoothing">Exponential Smoothing (Weighted Average)</option>
          </select>
        </Card>

        {/* Forecast Duration Selection */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                <FiTrendingUp className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Forecast Horizon</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mb-3 leading-relaxed">
              Choose the length of months to project into the future.
            </p>
          </div>
          <select
            value={forecastLength}
            onChange={(e) => setForecastLength(Number(e.target.value))}
            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-large text-xs font-semibold focus:outline-none"
          >
            <option value={1}>1 Month Ahead</option>
            <option value={2}>2 Months Ahead</option>
            <option value={3}>3 Months Ahead</option>
            <option value={6}>6 Months Ahead</option>
          </select>
        </Card>

        {/* Smoothing Parameter Adjuster */}
        <Card className="p-4 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                <FiSliders className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Smoothing Factor (α)</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mb-3 leading-relaxed">
              Adjust weight distribution (recent vs older months). Only active in Exponential Smoothing model.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              disabled={modelType !== 'smoothing'}
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="flex-grow accent-purple-600 disabled:opacity-40"
            />
            <span className={`text-xs font-bold w-10 text-center ${modelType !== 'smoothing' ? 'text-gray-300' : 'text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded'}`}>
              {alpha.toFixed(2)}
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={modelType !== 'smoothing' || loading}
              onClick={handleApplySmoothing}
              className="text-[10px] font-bold border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Apply
            </Button>
          </div>
        </Card>
      </div>

      {loading ? (
        <Card className="h-[400px] flex flex-col items-center justify-center gap-3">
          <FiRefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider animate-pulse">Running ML Models...</span>
        </Card>
      ) : (
        <>
          {/* Main Forecasting Visualization Chart */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Revenue Tracking & Forecasting</h3>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Actual Store Sales vs Model Future Forecasts</p>
              </div>
              <div className="flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#A66A2C]"></div>
                  <span className="text-gray-500">Actual Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-purple-600 border border-purple-600 border-dashed"></div>
                  <span className="text-gray-500">Forecasted Revenue</span>
                </div>
              </div>
            </div>
            
            <div className="w-full h-[320px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${Number(value).toLocaleString()}`,
                      name === 'revenue' ? 'Actual Revenue' : 'Forecasted Revenue'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="revenue" fill="#A66A2C" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="forecastedRevenue" fill="#a78bfa" stroke="#6366f1" strokeDasharray="3 3" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Model Statistics & Residual Analysis Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-4">ML Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Model Name</span>
                    <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-150 inline-block">
                      {modelStats?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Fitted Mathematical Formula</span>
                    <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded inline-block">
                      {modelStats?.equation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">{modelStats?.accuracyName}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-gray-800">{modelStats?.accuracyValue}</span>
                      <span className="text-[9px] font-extrabold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">
                        Optimal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 items-start mt-4 bg-amber-50 p-2.5 rounded-large border border-amber-100">
                <FiAlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[9px] text-amber-800 leading-relaxed font-semibold">
                  Model forecasts are calculated dynamically on the server by resolving least-squares matrices based on your live store transactions.
                </p>
              </div>
            </Card>

            {/* Residual Analysis Table */}
            <Card className="p-6 md:col-span-2">
              <h3 className="font-bold text-gray-800 text-sm mb-1">Historical Fit & Residual Analysis</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase mb-4">Validating model errors against last 3 transaction months</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-500">
                  <thead className="text-[9px] text-gray-400 uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="py-2">Month Index (x)</th>
                      <th className="py-2 text-right">Actual Revenue (Y)</th>
                      <th className="py-2 text-right">Model Fit (Ŷ)</th>
                      <th className="py-2 text-right">Residual Error (Y - Ŷ)</th>
                      <th className="py-2 text-center">Variance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelStats?.residuals?.map((r, i) => {
                      const variance = (Math.abs(r.residual) / r.actual) * 100;
                      return (
                        <tr key={i} className="border-b border-gray-50 font-semibold text-gray-700">
                          <td className="py-3 text-gray-400">Month #{r.index}</td>
                          <td className="py-3 text-right">₹{r.actual.toLocaleString()}</td>
                          <td className="py-3 text-right text-purple-600">₹{r.predicted.toLocaleString()}</td>
                          <td className={`py-3 text-right ${r.residual >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {r.residual >= 0 ? '+' : ''}₹{r.residual.toLocaleString()}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${variance < 5 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                              {variance.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* AI Sales Copilot SWOT & Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SWOT Matrix Card */}
            <Card className="p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center text-amber-600">
                  <FiPieChart className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">AI SWOT Strategic Matrix</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-3 bg-green-50/50 rounded-large border border-green-100">
                  <span className="text-[9px] font-black text-green-700 uppercase block mb-1">Strengths</span>
                  <ul className="list-disc pl-4 text-xs font-semibold text-gray-600 space-y-1">
                    {aiAnalysis?.swot?.strengths?.map((str, idx) => (
                      <li key={idx} className="leading-normal">{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-3 bg-red-50/50 rounded-large border border-red-100">
                  <span className="text-[9px] font-black text-red-700 uppercase block mb-1">Weaknesses</span>
                  <ul className="list-disc pl-4 text-xs font-semibold text-gray-600 space-y-1">
                    {aiAnalysis?.swot?.weaknesses?.map((str, idx) => (
                      <li key={idx} className="leading-normal">{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="p-3 bg-blue-50/50 rounded-large border border-blue-100">
                  <span className="text-[9px] font-black text-blue-700 uppercase block mb-1">Opportunities</span>
                  <ul className="list-disc pl-4 text-xs font-semibold text-gray-600 space-y-1">
                    {aiAnalysis?.swot?.opportunities?.map((str, idx) => (
                      <li key={idx} className="leading-normal">{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="p-3 bg-amber-50/50 rounded-large border border-amber-100">
                  <span className="text-[9px] font-black text-amber-700 uppercase block mb-1">Threats</span>
                  <ul className="list-disc pl-4 text-xs font-semibold text-gray-600 space-y-1">
                    {aiAnalysis?.swot?.threats?.map((str, idx) => (
                      <li key={idx} className="leading-normal">{str}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* AI Advisor Recommendations */}
            <Card className="p-6 md:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                    <FiActivity className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">AI Strategic Actions</h3>
                </div>

                <div className="space-y-3">
                  {aiAnalysis?.recommendations?.map((rec, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-xs font-black text-purple-700 flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs font-semibold text-gray-600 leading-relaxed font-semibold">
                        {typeof rec === 'object' ? (rec.description || rec.action || JSON.stringify(rec)) : rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50/30 px-3 py-2 rounded-large">
                <FiAward className="w-4 h-4 flex-shrink-0" />
                <span>Strategist Llama recommendation plan active.</span>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}