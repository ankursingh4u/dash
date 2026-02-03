'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Button, Input } from '@/components/ui';
import { Bot, Send, Sparkles, MessageSquare, History } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  'How do I add a new identity?',
  'What is the refund reminder feature?',
  'How can I export my data?',
  'How do platform accounts work?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Get help with your operations using AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-amber-500/20 mb-4">
                    <Bot className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    How can I help you today?
                  </h3>
                  <p className="text-gray-400 mt-2 max-w-md">
                    Ask me anything about managing your affiliate operations,
                    identities, websites, or platform accounts.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Suggested Questions */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-100">Suggested Questions</h3>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>

          {/* Features */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-100">What I Can Help With</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Understanding features and workflows</li>
              <li>• Navigating the dashboard</li>
              <li>• Data management tips</li>
              <li>• Troubleshooting common issues</li>
              <li>• Best practices and recommendations</li>
            </ul>
          </Card>

          {/* Note */}
          <Card className="bg-gray-800/50 border-gray-700">
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Note:</strong> This is a demo AI assistant.
              In production, this would be connected to a real AI service for
              intelligent responses based on your data.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getSimulatedResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('identity') || lowerQuestion.includes('identities')) {
    return 'To manage identities, go to Master Data > Identities. You can add new identities, edit existing ones, and track their status. Make sure to keep identity information up to date for smooth operations.';
  }

  if (lowerQuestion.includes('refund') || lowerQuestion.includes('reminder')) {
    return 'The refund reminder feature helps you track when orders are approaching their refund period. You can see upcoming reminders on the Overview dashboard and in the Orders tab for each platform.';
  }

  if (lowerQuestion.includes('export') || lowerQuestion.includes('csv')) {
    return 'You can export data from multiple places: Use the Export button in the Master Data sections to export identities, websites, or cards. For platform-specific data, use the Export All button on each platform page.';
  }

  if (lowerQuestion.includes('platform') || lowerQuestion.includes('account')) {
    return 'Platform accounts represent your affiliate accounts on each platform. Navigate to Platforms and select a platform to view and manage advertisers, accounts, and orders specific to that platform.';
  }

  return "I understand you're asking about " + question + ". Could you provide more details about what specific aspect you'd like help with? I can assist with identities, websites, cards, platform management, and more.";
}
