"use client";

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare,
  Search,
  Star,
  MoreVertical,
  Send,
  ArrowLeft,
  Loader2,
  Archive,
  Trash2,
  X
} from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';
import { 
  listenToUserConversations,
  listenToConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUserInfoFromAuth,
  toggleStarConversation,
  toggleArchiveConversation,
  deleteConversation,
  type Conversation,
  type Message
} from '@/services/messagingService';
import { EmojiPicker } from '@/components/EmojiPicker';
import { ImageUpload } from '@/components/ImageUpload';
import { ImageModal } from '@/components/ImageModal';
import type { Unsubscribe } from 'firebase/firestore';

export default function MessagesPageClient({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { user } = useAuth();
  const searchParamsValue = use(searchParams);
  const conversationId = searchParamsValue.conversation;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'favorites'>('all');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [clearImagePreview, setClearImagePreview] = useState(false);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; url: string; name?: string }>({
    isOpen: false,
    url: '',
    name: ''
  });
  
  const messagesUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const conversationsUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = listenToUserConversations(user.uid, (data) => {
        setConversations(data);
        setLoading(false);
        
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0]);
          loadMessages(data[0].id);
        }
      });
      
      conversationsUnsubscribeRef.current = unsubscribe;
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
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

  useEffect(() => {
    return () => {
      if (messagesUnsubscribeRef.current) {
        messagesUnsubscribeRef.current();
      }
      if (conversationsUnsubscribeRef.current) {
        conversationsUnsubscribeRef.current();
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadMessages = async (convId: string) => {
    setMessagesLoading(true);
    
    if (messagesUnsubscribeRef.current) {
      messagesUnsubscribeRef.current();
    }
    
    try {
      const unsubscribe = listenToConversationMessages(convId, (data) => {
        setMessages(data);
        setMessagesLoading(false);
        
        if (user) {
          markMessagesAsRead(convId, user.uid);
        }
      });
      
      messagesUnsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedConversation || !user) return;

    setSendingMessage(true);
    try {
      const userInfo = getUserInfoFromAuth(user);
      
      let attachment = undefined;
      if (selectedImage) {
        attachment = {
          type: 'image' as const,
          url: URL.createObjectURL(selectedImage),
          filename: selectedImage.name,
        };
      }
      
      const success = await sendMessage(
        selectedConversation.id,
        user.uid,
        selectedConversation.adOwnerId === user.uid ? selectedConversation.customerId : selectedConversation.adOwnerId,
        newMessage.trim() || (attachment ? '📎 Image' : ''),
        userInfo.name,
        userInfo.avatar,
        attachment
      );

      if (success) {
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview(null);
        setClearImagePreview(true);
        
        if (attachment && attachment.url.startsWith('blob:')) {
          URL.revokeObjectURL(attachment.url);
        }
        
        setTimeout(() => {
          setClearImagePreview(false);
        }, 100);
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

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (url: string, name?: string) => {
    setImageModal({
      isOpen: true,
      url,
      name
    });
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setClearImagePreview(true);
    
    setTimeout(() => {
      setClearImagePreview(false);
    }, 100);
  };

  const handleStarConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const success = await toggleStarConversation(selectedConversation.id, selectedConversation.isStarred || false);
      if (success) {
        toast({
          title: selectedConversation.isStarred ? "Unstarred" : "Starred",
          description: `Conversation ${selectedConversation.isStarred ? 'removed from' : 'added to'} favorites.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const success = await toggleArchiveConversation(selectedConversation.id, selectedConversation.isArchived || false);
      if (success) {
        toast({
          title: selectedConversation.isArchived ? "Unarchived" : "Archived",
          description: `Conversation ${selectedConversation.isArchived ? 'removed from' : 'moved to'} archive.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const success = await deleteConversation(selectedConversation.id);
      if (success) {
        toast({
          title: "Deleted",
          description: "Conversation has been permanently deleted.",
        });
        setSelectedConversation(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = (conv.adOwnerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conv.listingTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'unread') {
      return matchesSearch && conv.unreadCount > 0;
    } else if (activeTab === 'favorites') {
      return matchesSearch && conv.isStarred;
    }
    
    return matchesSearch && !conv.isArchived;
  });

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
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex">
        {/* Conversations List */}
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
                  <MessageSquare className="h-4 w-4 !size-4" />
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
              <Button 
                variant={activeTab === 'all' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setActiveTab('all')}
              >
                All
              </Button>
              <Button 
                variant={activeTab === 'unread' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setActiveTab('unread')}
              >
                Unread
              </Button>
              <Button 
                variant={activeTab === 'favorites' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setActiveTab('favorites')}
              >
                Favorites
              </Button>
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
                <MessageSquare className="h-12 w-12 !size-12 mx-auto mb-4 text-gray-300" />
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
                      {conversation.isStarred && (
                        <Star className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
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

        {/* Chat Area */}
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleStarConversation}
                    className={selectedConversation.isStarred ? 'text-yellow-500' : ''}
                  >
                    <Star className={`h-4 w-4 ${selectedConversation.isStarred ? 'fill-current' : ''}`} />
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleStarConversation}
                    className={selectedConversation.isStarred ? 'text-yellow-500' : ''}
                  >
                    <Star className={`h-4 w-4 ${selectedConversation.isStarred ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleArchiveConversation}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleDeleteConversation}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 !size-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?.uid
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-900 border'
                            }`}
                          >
                            {message.attachment && (
                              <div className="mb-2">
                                <Image
                                  src={message.attachment.url}
                                  alt={message.attachment.filename}
                                  width={200}
                                  height={150}
                                  className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => handleImageClick(message.attachment.url, message.attachment.filename)}
                                />
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-between mt-1 ${
                              message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <p className="text-xs">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Scroll anchor */}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="p-4 border-t bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedImage?.name}</p>
                      <p className="text-xs text-gray-500">Ready to send</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  <ImageUpload 
                    onImageSelect={handleImageSelect} 
                    disabled={sendingMessage}
                    clearPreview={clearImagePreview}
                  />
                  <Input
                    placeholder="Write A Message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && !selectedImage) || sendingMessage}
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
                <MessageSquare className="h-16 w-16 !size-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No conversation selected</h2>
                <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, url: '', name: '' })}
        imageUrl={imageModal.url}
        imageName={imageModal.name}
      />
    </div>
  );
}
