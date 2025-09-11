"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Search, 
  MoreVertical,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getUserConversations, getUnreadMessageCount, type Conversation } from '@/services/messagingService';

export function ChatDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecentConversations();
      loadUnreadCount();
    }
  }, [user]);

  const loadRecentConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getUserConversations(user.uid);
      // Get only the 5 most recent conversations
      setConversations(data.slice(0, 5));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadMessageCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/messages?conversation=${conversationId}`);
  };

  const handleViewAllMessages = () => {
    router.push('/messages');
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="font-normal p-0">
          <div className="flex items-center justify-between p-1">
            <h3 className="text-sm font-semibold">Chats</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Search className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </DropdownMenuLabel>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-2">
          <Button variant="default" size="sm" className="flex-1 text-xs">All</Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">Unread</Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">Favorites</Button>
        </div>

        <DropdownMenuSeparator className="my-2" />
        
        {/* Conversations List */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-sm text-gray-500">No conversations yet</div>
            </div>
          ) : (
            conversations.map((conversation) => (
              <DropdownMenuItem
                key={conversation.id}
                className="p-2 cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="relative">
                    <Image
                      src={conversation.adOwnerId === user.uid ? conversation.customerAvatar || 'https://placehold.co/40x40.png' : conversation.adOwnerAvatar || 'https://placehold.co/40x40.png'}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    {conversation.unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">
                        {conversation.adOwnerId === user.uid ? conversation.customerName : conversation.adOwnerName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    
                    {conversation.listingTitle && (
                      <p className="text-xs text-blue-600 truncate">
                        Re: {conversation.listingTitle}
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="my-2" />
        
        {/* Footer Link */}
        <DropdownMenuItem className="p-2 cursor-pointer" onClick={handleViewAllMessages}>
          <div className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700">
            <span className="text-sm">See All in Message Center</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
