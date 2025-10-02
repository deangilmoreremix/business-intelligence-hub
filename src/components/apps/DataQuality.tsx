import React, { useState } from 'react';
import { Database, CheckCircle, AlertTriangle, XCircle, TrendingUp, Zap } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { Section } from '../ui/Section';
import KPICard from '../ui/KPICard';
import { ModernButton } from '../ui/ModernButton';
import { AIProcessingIndicator } from '../ui/AIProcessingIndicator';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';

interface DataQualityProps {
  onBack: () => void;
}

export const DataQuality: React.FC<DataQualityProps> = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const qualityMetrics = [
    { title: "Overall Quality Score", value: "87%", change: 8.3, trend: "up" as const, color: "success" as const },
    { title: "Data Completeness", value: "92%", change: 5.7, trend: "up" as const, color: "success" as const },
    { title: "Accuracy Rate", value: "94%", change: 3.2, trend: "up" as const, color: "success" as const },
    { title: "Duplicate Records", value: "156", change: -23.1, trend: "up" as const, color: "success" as const }
  ];

  const dataCategories = [
    { 
      category: "Contact Information", 
      completeness: 94, 
      accuracy: 97, 
      issues: 12,
      records: "15,234",
      status: "excellent"
    },
    { 
      category: "Deal Data", 
      completeness: 89, 
      accuracy: 92, 
      issues: 23,
      records: "3,456",
      status: "good"
    },
    { 
      category: "Activity Logs", 
      completeness: 76, 
      accuracy: 88, 
      issues: 45,
      records: "28,901",
      status: "needs-improvement"
    },
    { 
      category: "Communication History", 
      completeness: 82, 
      accuracy: 85, 
      issues: 34,
      records: "12,678",
      status: "good"
    }
  ];

  const qualityIssues = [
    {
      type: "Missing Email Addresses",
      severity: "High",
      count: 234,
      impact: "Contact communication limited",
      suggestion: "Implement required field validation"
    },
    {
      type: "Duplicate Contacts", 
      severity: "Medium",
      count: 156,
      impact: "Skewed analytics and reporting",
      suggestion: "Run automated deduplication process"
    },
    {
      type: "Incomplete Deal Information",
      severity: "High", 
      count: 78,
      impact: "Inaccurate forecasting",
      suggestion: "Mandate deal value and stage updates"
    },
    {
      type: "Outdated Activity Records",
      severity: "Low",
      count: 567,
      impact: "Historical reporting gaps",
      suggestion: "Archive old records systematically"
    }
  ];

  const runQualityScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const headerActions = (
    <>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Categories</option>
        <option value="contacts">Contact Information</option>
        <option value="deals">Deal Data</option>
        <option value="activities">Activity Logs</option>
      </select>
      <ModernButton onClick={runQualityScan} loading={isScanning}>
        <Zap className="w-4 h-4" />
        Run Quality Scan
      </ModernButton>
    </>
  );

  return (
    <PageWrapper
      title="Data Quality Dashboard"
      description="Data completeness scoring and quality analysis"
      onBack={onBack}
      appTheme="cyan"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <AIProcessingIndicator 
          isProcessing={isScanning} 
          message="AI is scanning data quality across all systems..."
          type="brain"
        />
      </div>

      {/* AI Analysis Section */}
      <AIAnalysisSection
        appId="data-quality"
        analysisType="integration"
        title="AI Data Quality Analysis"
        description="AI-powered data quality assessment and improvement recommendations"
        className="mb-8"
        defaultProvider="gemini"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {qualityMetrics.map((metric, index) => (
          <KPICard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={<Database className="w-6 h-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Section
          title="Data Category Analysis"
          description="Quality metrics by data type"
          icon={<TrendingUp className="w-6 h-6 text-cyan-600" />}
        >
          <div className="space-y-4">
            {dataCategories.map((category, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(category.status)}`}>
                    {category.status.replace('-', ' ')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Records</p>
                    <p className="font-semibold text-gray-900">{category.records}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Issues</p>
                    <p className="font-semibold text-red-600">{category.issues}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Completeness</span>
                      <span className="font-medium">{category.completeness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${category.completeness}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium">{category.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${category.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Quality Issues"
          description="Identified data quality problems"
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
        >
          <div className="space-y-4">
            {qualityIssues.map((issue, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{issue.type}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{issue.count}</span>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Impact: {issue.impact}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg mb-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">AI Suggestion:</span> {issue.suggestion}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <ModernButton variant="primary" size="sm">
                    Fix Issue
                  </ModernButton>
                  <ModernButton variant="outline" size="sm">
                    View Details
                  </ModernButton>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Data Quality Improvement"
        description="Strategies to enhance data quality"
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Prevention</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Implement data validation rules</li>
              <li>• Mandatory field requirements</li>
              <li>• Real-time quality checks</li>
              <li>• User training programs</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Automation</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Automated duplicate detection</li>
              <li>• Data enrichment services</li>
              <li>• Scheduled quality scans</li>
              <li>• Smart data formatting</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Governance</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Data quality standards</li>
              <li>• Regular audit processes</li>
              <li>• Quality metrics tracking</li>
              <li>• Continuous improvement plans</li>
            </ul>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};