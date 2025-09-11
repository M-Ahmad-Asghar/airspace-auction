"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare,
  Search,
  Star,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  Menu
} from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';
import { 
  getUserConversations, 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead,
  type Conversation,
  type Message 
} from '@/services/messagingService';

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Get conversation ID from URL params
  const conversationId = searchParams.get('conversation');

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        loadMessages(conversationId);
        setShowMobileChat(true);
      }
    }
  }, [conversationId, conversations]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getUserConversations(user.uid);
      setConversations(data);
      
      // If no conversation is selected and we have conversations, select the first one
      if (!selectedConversation && data.length > 0) {
        setSelectedConversation(data[0]);
        loadMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const data = await getConversationMessages(convId);
      setMessages(data);
      
      // Mark messages as read
      if (user) {
        await markMessagesAsRead(convId, user.uid);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSendingMessage(true);
    try {
      const success = await sendMessage(
        selectedConversation.id,
        user.uid,
        selectedConversation.adOwnerId === user.uid ? selectedConversation.customerId : selectedConversation.adOwnerId,
        newMessage.trim(),
        user.displayName || 'Unknown User',
        user.photoURL
      );

      if (success) {
        setNewMessage('');
        // Reload messages
        loadMessages(selectedConversation.id);
        // Reload conversations to update last message
        loadConversations();
      } else {
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.adOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listingTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setShowMobileChat(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Conversations List - Hidden on mobile when chat is open */}
        <div className={`w-full lg:w-1/3 border-r bg-white flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">ad</div>
              <div className="text-sm font-medium">airplanedeals.com</div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop/Mobile Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Inbox</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden lg:flex">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden lg:flex">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-1">
              <Button variant="default" size="sm" className="flex-1">All</Button>
              <Button variant="outline" size="sm" className="flex-1">Unread</Button>
              <Button variant="outline" size="sm" className="flex-1">Favorites</Button>
            </div>
            
            {/* Search */}
            <div className="mt-3">
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={conversation.adOwnerId === user?.uid ? conversation.customerAvatar || 'https://placehold.co/40x40.png' : conversation.adOwnerAvatar || 'https://placehold.co/40x40.png'}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      {conversation.unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">
                          {conversation.adOwnerId === user?.uid ? conversation.customerName : conversation.adOwnerName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      {conversation.listingTitle && (
                        <p className="text-xs text-blue-600 truncate">
                          Re: {conversation.listingTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mobile Footer Link */}
          <div className="lg:hidden p-4 border-t">
            <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
              See All in Message Center
            </Button>
          </div>
        </div>

        {/* Chat Area - Hidden on mobile when conversations list is shown */}
        <div className={`flex-1 flex flex-col ${showMobileChat ? 'flex' : 'hidden lg:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Mobile Chat Header */}
              <div className="lg:hidden p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Image
                    src={selectedConversation.adOwnerId === user?.uid ? selectedConversation.customerAvatar || 'https://placehold.co/40x40.png' : selectedConversation.adOwnerAvatar || 'https://placehold.co/40x40.png'}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold text-sm">
                      Chat With {selectedConversation.adOwnerId === user?.uid ? selectedConversation.customerName : selectedConversation.adOwnerName}
                    </h2>
                    <p className="text-xs text-gray-500">Verified & Trusted</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Desktop Chat Header */}
              <div className="hidden lg:flex p-4 border-b bg-white items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image
                    src={selectedConversation.adOwnerId === user?.uid ? selectedConversation.customerAvatar || 'https://placehold.co/40x40.png' : selectedConversation.adOwnerAvatar || 'https://placehold.co/40x40.png'}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold">
                      Chat With {selectedConversation.adOwnerId === user?.uid ? selectedConversation.customerName : selectedConversation.adOwnerName}
                    </h2>
                    <p className="text-sm text-gray-500">Verified & Trusted</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.uid
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Write A Message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No conversation selected</h2>
                <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
