import React, { useState } from 'react';
import { ArrowLeft, FileText, TrendingUp, Users, DollarSign, Target, Download } from 'lucide-react';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import { GlassCard } from '../ui/GlassCard';
import { AIChart } from '../AIChart';
import { Avatar } from '../ui/Avatar';
import { teamMembers } from '../../data/teamMembers';

interface PerformanceReportsProps {
  onBack?: () => void;
}

export const PerformanceReports: React.FC<PerformanceReportsProps> = ({ onBack }) => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  const reportMetrics = [
    { label: "Total Revenue", value: "$2.4M", change: "+18%", trend: "up" as const },
    { label: "Deals Closed", value: "147", change: "+12%", trend: "up" as const },
    { label: "Team Performance", value: "89%", change: "+5%", trend: "up" as const },
    { label: "Goal Achievement", value: "94%", change: "+8%", trend: "up" as const }
  ];

  const reportTypes = [
    { id: 'overview', name: 'Performance Overview', icon: FileText },
    { id: 'team', name: 'Team Analysis', icon: Users },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign },
    { id: 'goals', name: 'Goal Tracking', icon: Target }
  ];

  const quarterlyData = [
    { quarter: "Q1 2024", revenue: "$1.8M", deals: 89, growth: "+15%" },
    { quarter: "Q2 2024", revenue: "$2.1M", deals: 102, growth: "+17%" },
    { quarter: "Q3 2024", revenue: "$2.4M", deals: 117, growth: "+14%" },
    { quarter: "Q4 2024", revenue: "$2.7M", deals: 128, growth: "+13%" }
  ];

  const topPerformers = teamMembers.map(member => ({
    ...member,
    score: Math.floor(Math.random() * 20) + 80,
    quota: Math.floor(Math.random() * 30) + 90,
    deals: Math.floor(Math.random() * 15) + 10
  })).sort((a, b) => b.score - a.score);

  const generateReport = () => {
    // Simulate report generation
    console.log(`Generating ${selectedReport} report for ${timeRange}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <ModernButton variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </ModernButton>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive performance analytics and reporting</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>
            <ModernButton onClick={generateReport}>
              <Download className="w-4 h-4" />
              Export Report
            </ModernButton>
          </div>
        </div>

        <AIAnalysisSection
          appId="performance-reports"
          analysisType="analytics"
          title="AI Performance Reports Analysis"
          description="Comprehensive performance analytics and reporting."
          className="mb-8"
        />



        {/* Report Type Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {reportTypes.map(report => {
            const Icon = report.icon;
            return (
              <ModernButton
                key={report.id}
                variant={selectedReport === report.id ? 'primary' : 'ghost'}
                onClick={() => setSelectedReport(report.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {report.name}
              </ModernButton>
            );
          })}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportMetrics.map((metric, index) => (
            <AIChart
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              data={[1.8, 2.0, 1.9, 2.2, 2.4, 2.1, 2.5, 2.7, 2.6, 2.8, 2.9, 3.1]}
            />
          ))}
        </div>

        {selectedReport === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Quarterly Trends */}
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Quarterly Performance</h2>
                  <p className="text-sm text-gray-600">Revenue and deal trends by quarter</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {quarterlyData.map((quarter, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{quarter.quarter}</h3>
                      <p className="text-sm text-gray-600">{quarter.deals} deals closed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl text-gray-900">{quarter.revenue}</p>
                      <p className="text-sm text-green-600">{quarter.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Key Insights */}
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Key Insights</h2>
                  <p className="text-sm text-gray-600">AI-generated performance insights</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Strong Performers</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Enterprise segment up 24% this quarter</li>
                    <li>• Video call conversions improved 18%</li>
                    <li>• Follow-up response rate at all-time high</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Areas for Improvement</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• SMB segment cycle time increased 15%</li>
                    <li>• Proposal stage conversion down 3%</li>
                    <li>• Weekend activity needs optimization</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Recommendations</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Focus on SMB process optimization</li>
                    <li>• Enhance proposal templates</li>
                    <li>• Implement weekend coverage strategy</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {selectedReport === 'team' && (
          <GlassCard className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Team Performance Analysis</h2>
                <p className="text-sm text-gray-600">Individual contributor metrics and rankings</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPerformers.map((member, index) => (
                <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar 
                      alt={member.name} fallback={member.name} 
                      status={member.status}
                      size="md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                      index < 2 ? 'bg-green-100 text-green-800' : 
                      index < 4 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Performance Score</span>
                        <span className="font-medium">{member.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${member.score}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Quota Achievement</span>
                        <span className="font-medium">{member.quota}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(member.quota, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="pt-2 text-center">
                      <p className="text-2xl font-bold text-gray-900">{member.deals}</p>
                      <p className="text-xs text-gray-600">Deals Closed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Executive Summary */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Executive Summary</h2>
              <p className="text-sm text-gray-600">High-level performance overview for leadership</p>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Highlights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Revenue exceeded target by 18% this period
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Team productivity improved across all metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Customer satisfaction scores at highest level
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Pipeline health indicators trending positive
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Recommendations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Increase investment in top-performing segments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Expand successful processes to underperforming areas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Consider additional training for emerging opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Implement advanced analytics for predictive insights
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};