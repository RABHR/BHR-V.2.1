'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  sender_name: string;
  message: string;
  context: string;
  created_at: string;
  is_read: number;
}

interface MessageGroupedByUserProps {
  messages: Message[];
  onRefresh?: () => void;
}

export function MessageGroupedByUser({ messages, onRefresh }: MessageGroupedByUserProps) {
  const [expandedSender, setExpandedSender] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState<Set<number>>(new Set());

  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((msg) => {
    const senderKey = msg.sender_name || 'Unknown';
    if (!groupedMessages[senderKey]) {
      groupedMessages[senderKey] = [];
    }
    groupedMessages[senderKey].push(msg);
  });

  const handleMarkAsRead = async (messageId: number) => {
    setMarkingRead((prev) => new Set(prev).add(messageId));
    try {
      await adminApi.markMessageRead(messageId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    } finally {
      setMarkingRead((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const getContextBadgeColor = (context: string): string => {
    switch (context) {
      case 'timesheets':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'visa':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'activities':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'messages':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getContextIcon = (context: string): string => {
    switch (context) {
      case 'timesheets':
        return '⏱️ Timesheets';
      case 'visa':
        return '📄 Visa & Docs';
      case 'activities':
        return '📋 Activities';
      case 'messages':
        return '💬 Message';
      default:
        return '📨 ' + context;
    }
  };

  const getSenderColor = (sender: string): string => {
    const colors = [
      'border-blue-500',
      'border-orange-500',
      'border-green-500',
      'border-red-500',
      'border-purple-500',
      'border-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = ((hash << 5) - hash) + sender.charCodeAt(i);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([sender, senderMessages]) => {
        const unreadCount = senderMessages.filter((m) => m.is_read === 0).length;
        const isExpanded = expandedSender === sender;

        return (
          <div key={sender} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSender(isExpanded ? null : sender)}
              className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`flex-shrink-0 px-3 py-1 rounded-full font-semibold text-sm border-l-4 ${getSenderColor(sender)} bg-white`}>
                  {sender.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{sender}</p>
                  <p className="text-xs text-gray-600">
                    {senderMessages.length} message{senderMessages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="divide-y bg-white">
                {senderMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                      msg.is_read === 0
                        ? 'border-l-red-500 bg-red-50'
                        : 'border-l-green-500'
                    }`}
                    onClick={() =>
                      msg.is_read === 0 && handleMarkAsRead(msg.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getContextBadgeColor(msg.context)}>
                            {getContextIcon(msg.context)}
                          </Badge>
                          {msg.is_read === 0 && (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="text-xs text-red-600 font-medium">
                                Unread
                              </span>
                            </span>
                          )}
                          {msg.is_read === 1 && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Read
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2 break-words">
                          {msg.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      {msg.is_read === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(msg.id);
                          }}
                          disabled={markingRead.has(msg.id)}
                          className="flex-shrink-0 px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xs rounded transition-colors"
                        >
                          {markingRead.has(msg.id) ? 'Marking...' : 'Mark Read'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
