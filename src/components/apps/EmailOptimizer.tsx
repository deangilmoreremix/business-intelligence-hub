import React, { useState } from 'react';
import { Mail, TrendingUp, Zap, Target, Clock, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';

interface EmailOptimizerProps {
  onBack: () => void;
}

export const EmailOptimizer: React.FC<EmailOptimizerProps> = ({ onBack }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('open-rate');

  const emailMetrics = [
    { title: "Open Rate", value: "68.5%", change: 12.3, trend: "up" as const, color: "success" as const },
    { title: "Response Rate", value: "34.2%", change: 8.7, trend: "up" as const, color: "primary" as const },
    { title: "Click Through Rate", value: "12.8%", change: 15.2, trend: "up" as const, color: "success" as const },
    { title: "Avg Response Time", value: "2.3h", change: -18.5, trend: "up" as const, color: "success" as const }
  ];

  const emailInsights = [
    {
      type: "Subject Line",
      current: "Quick follow-up on our conversation",
      optimized: "Ready to move forward? Quick question inside",
      improvement: "+23% open rate",
      confidence: 89
    },
    {
      type: "Send Time",
      current: "2:00 PM weekdays",
      optimized: "10:30 AM Tuesday/Thursday",
      improvement: "+18% response rate",
      confidence: 92
    },
    {
      type: "Email Length",
      current: "Average 180 words",
      optimized: "Keep under 125 words",
      improvement: "+15% engagement",
      confidence: 85
    }
  ];

  const runOptimization = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsOptimizing(false);
  };

  const headerActions = (
    <ModernButton onClick={runOptimization} loading={isOptimizing}>
      <Zap className="w-4 h-4" />
      Optimize Emails
    </ModernButton>
  );

  return (
    <PageWrapper
      title="Smart Email Optimizer"
      description="AI-powered email response optimization and insights"
      onBack={onBack}
      appTheme="blue"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isOptimizing} 
          message="AI is optimizing your email performance..."
          type="brain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {emailMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Mail className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="AI Email Optimization"
          description="Personalized recommendations to improve performance"
          icon={<Target className="w-6 h-6 text-blue-600" />}
        >
          <div className="space-y-6">
            {emailInsights.map((insight, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{insight.type}</h3>
                  <div className="text-sm text-green-600 font-medium">{insight.improvement}</div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-red-600 font-medium">Current:</span>
                    <span className="text-sm text-gray-700">{insight.current}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-green-600 font-medium">Optimized:</span>
                    <span className="text-sm text-gray-700">{insight.optimized}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${insight.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{insight.confidence}% confident</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Email Performance Trends"
          description="Historical performance analytics"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        >
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Best Performing</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Tuesday 10:30 AM sends</span>
                  <span className="font-medium">92% open rate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Question-based subjects</span>
                  <span className="font-medium">78% response rate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Under 100 words</span>
                  <span className="font-medium">65% CTR</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-3">Needs Improvement</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Friday afternoon sends</span>
                  <span className="font-medium">32% open rate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Generic subjects</span>
                  <span className="font-medium">18% response rate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Over 200 words</span>
                  <span className="font-medium">8% CTR</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Email Optimization Strategies"
        description="Actionable recommendations for better email performance"
        icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Subject Line Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use questions to engage curiosity</li>
              <li>• Include recipient's name when relevant</li>
              <li>• Keep under 50 characters</li>
              <li>• Create urgency without being pushy</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Timing Optimization</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Tuesday-Thursday optimal days</li>
              <li>• 10-11 AM best send times</li>
              <li>• Avoid Monday mornings</li>
              <li>• Consider recipient time zones</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Content Strategy</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Lead with value proposition</li>
              <li>• Use bullet points for clarity</li>
              <li>• Include clear call-to-action</li>
              <li>• Personalize based on context</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};