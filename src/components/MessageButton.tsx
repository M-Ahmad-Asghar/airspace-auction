"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createConversation, getUserInfoFromAuth } from '@/services/messagingService';

interface MessageButtonProps {
  listingId: string;
  adOwnerId: string;
  listingData: any;
}

export function MessageButton({ listingId, adOwnerId, listingData }: MessageButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }

    if (user.uid === adOwnerId) {
      toast({
        title: "Cannot Message Yourself",
        description: "You cannot send messages to yourself.",
        variant: "destructive",
      });
      return;
    }

    console.log('MessageButton: Starting conversation creation...');
    console.log('User:', user.uid, user.displayName || user.email);
    console.log('Ad Owner:', adOwnerId);
    console.log('Listing:', listingId, listingData?.title);
    console.log('Listing data:', listingData);

    setLoading(true);
    try {
      // Get user info from Firebase Auth
      const userInfo = getUserInfoFromAuth(user);
      console.log('User info:', userInfo);
      
      // Get ad owner info - use available fields from listing data
      const adOwnerInfo = {
        name: listingData?.userName || listingData?.user?.displayName || listingData?.user?.email?.split('@')[0] || 'Ad Owner',
        avatar: listingData?.userAvatar || listingData?.user?.photoURL || undefined,
      };
      console.log('Ad owner info:', adOwnerInfo);
      
      // Create conversation
      console.log('Calling createConversation with:', {
        adOwnerId,
        adOwnerName: adOwnerInfo.name,
        adOwnerAvatar: adOwnerInfo.avatar,
        customerId: user.uid,
        customerName: userInfo.name,
        customerAvatar: userInfo.avatar,
        listingId,
        listingTitle: listingData?.title || 'Listing'
      });
      
      const conversationId = await createConversation(
        adOwnerId,
        adOwnerInfo.name,
        adOwnerInfo.avatar,
        user.uid,
        userInfo.name,
        userInfo.avatar,
        listingId,
        listingData?.title || 'Listing'
      );

      console.log('Conversation creation result:', conversationId);

      if (conversationId) {
        console.log('Navigating to messages page with conversation:', conversationId);
        // Navigate to messages page with conversation
        router.push(`/messages?conversation=${conversationId}`);
        
        toast({
          title: "Success",
          description: "Conversation started successfully!",
        });
      } else {
        console.error('Failed to create conversation - conversationId is null');
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: `Failed to start conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSendMessage}
      disabled={loading || !user || user.uid === adOwnerId}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
    >
      <MessageSquare className="h-4 w-4 !size-4" />
      <span>{loading ? 'Starting...' : 'Send Message'}</span>
    </Button>
  );
}
