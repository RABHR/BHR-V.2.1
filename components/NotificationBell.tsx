'use client';

import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, FileText, Clock } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationBellProps {
  userType?: 'employee' | 'manager' | 'admin';
  onRefresh?: () => void;
}

export function NotificationBell({ userType = 'employee', onRefresh }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const unread = await adminApi.getUnreadCount();
      setUnreadCount(unread.unread_count || 0);

      let msgs: any[] = [];
      if (userType === 'employee') {
        msgs = await adminApi.getEmployeeMessages();
      } else if (userType === 'manager') {
        msgs = await adminApi.getManagerMessages();
      } else if (userType === 'admin') {
        msgs = await adminApi.getAdminMessages();
      }

      setMessages(msgs.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userType]);

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await adminApi.markMessageRead(messageId);
      fetchNotifications();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const getContextIcon = (context: string) => {
    switch (context) {
      case 'timesheets':
        return <Clock className="w-4 h-4" />;
      case 'visa':
        return <FileText className="w-4 h-4" />;
      case 'activities':
        return <FileText className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getContextColor = (context: string): string => {
    switch (context) {
      case 'timesheets':
        return 'bg-blue-100 text-blue-800';
      case 'visa':
        return 'bg-purple-100 text-purple-800';
      case 'activities':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-72">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No new messages
            </div>
          ) : (
            <div className="divide-y">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                    msg.is_read === 0 ? 'border-l-red-500 bg-red-50' : 'border-l-gray-300'
                  }`}
                  onClick={() => msg.is_read === 0 && handleMarkAsRead(msg.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getContextColor(msg.context)}`}>
                      {getContextIcon(msg.context)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {msg.sender_name || 'Unknown'}
                        </p>
                        {msg.is_read === 0 && (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {msg.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
