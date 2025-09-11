"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Star,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  CheckCircle,
  Clock,
  Verified,
  Loader2
} from 'lucide-react';
import { 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead,
  type Message,
  type Conversation 
} from '@/services/messagingService';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ConversationPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const conversationId = params.id as string;

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages();
      markMessagesAsRead(conversationId, user.uid);
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const data = await getConversationMessages(conversationId);
      setMessages(data);
      
      // For now, we'll create a mock conversation object
      // In a real app, you'd fetch this from the conversation service
      setConversation({
        id: conversationId,
        listingId: 'mock-listing',
        listingTitle: 'Sample Aircraft Listing',
        listingImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&crop=center',
        adOwnerId: 'mock-owner',
        adOwnerName: 'John Seller',
        adOwnerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        buyerId: user?.uid || 'mock-buyer',
        buyerName: user?.displayName || 'Current User',
        buyerAvatar: user?.photoURL || '',
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId) return;

    setSending(true);
    try {
      const success = await sendMessage(
        conversationId,
        user.uid,
        user.displayName || 'User',
        user.photoURL || '',
        newMessage.trim()
      );

      if (success) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conversation Not Found</h2>
          <p className="text-gray-600 mb-4">This conversation may have been deleted or you don't have access to it.</p>
          <Button onClick={() => router.push('/messages')}>
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  const otherUser = user?.uid === conversation.adOwnerId 
    ? { name: conversation.buyerName, avatar: conversation.buyerAvatar }
    : { name: conversation.adOwnerName, avatar: conversation.adOwnerAvatar };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <Image
                src={otherUser.avatar || '/placeholder-avatar.png'}
                alt={otherUser.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div>
                <h1 className="font-semibold text-lg">Chat With {otherUser.name}</h1>
                <div className="flex items-center space-x-1">
                  <Verified className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Verified & Trusted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Star className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.uid;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center space-x-1 mt-1 ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className={`text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                    {isOwnMessage && (
                      <div className="flex items-center">
                        {message.read ? (
                          <CheckCircle className="h-3 w-3 text-blue-200" />
                        ) : (
                          <Clock className="h-3 w-3 text-blue-200" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t sticky bottom-0 p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write A Message"
            className="flex-1"
            disabled={sending}
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
