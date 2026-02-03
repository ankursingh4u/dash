'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';
import { BookOpen, Video, FileText, ExternalLink, GraduationCap, Lightbulb } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  type: 'article' | 'video' | 'doc';
  url?: string;
}

const resources: Resource[] = [
  {
    title: 'Getting Started with Affiliate Marketing',
    description: 'Learn the basics of affiliate marketing and how to get started.',
    type: 'article',
    url: '#',
  },
  {
    title: 'Platform Setup Guide',
    description: 'Step-by-step guide to setting up accounts on major affiliate platforms.',
    type: 'doc',
    url: '#',
  },
  {
    title: 'Understanding Commission Structures',
    description: 'Learn about different commission models and how to maximize earnings.',
    type: 'video',
    url: '#',
  },
  {
    title: 'Identity Management Best Practices',
    description: 'Tips for managing multiple identities securely and efficiently.',
    type: 'article',
    url: '#',
  },
  {
    title: 'Refund Prevention Strategies',
    description: 'Learn techniques to minimize refunds and chargebacks.',
    type: 'video',
    url: '#',
  },
  {
    title: 'Website Optimization for Conversions',
    description: 'Optimize your websites for better conversion rates.',
    type: 'doc',
    url: '#',
  },
];

const typeIcons = {
  article: <FileText className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  doc: <BookOpen className="w-5 h-5" />,
};

const typeColors = {
  article: 'bg-blue-500/20 text-blue-400',
  video: 'bg-purple-500/20 text-purple-400',
  doc: 'bg-green-500/20 text-green-400',
};

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Center"
        description="Resources and guides to help you succeed"
      />

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-500/20">
            <GraduationCap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Welcome to the Learning Center</h3>
            <p className="text-gray-400 mt-1">
              Browse our collection of resources, guides, and tutorials to help you master
              affiliate marketing operations.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Tips */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-100">Quick Tips</h3>
        </div>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-amber-500 font-bold">1.</span>
            Always keep your identity information up to date to avoid account issues.
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-500 font-bold">2.</span>
            Monitor refund reminder dates to take action before commissions are clawed back.
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-500 font-bold">3.</span>
            Regularly export your data for backup and reporting purposes.
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-500 font-bold">4.</span>
            Use the undo history feature to quickly revert any mistakes.
          </li>
        </ul>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:border-gray-600 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${typeColors[resource.type]}`}>
                {typeIcons[resource.type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-100">{resource.title}</h4>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
                <span className="text-xs text-gray-500 mt-2 inline-block capitalize">
                  {resource.type}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
