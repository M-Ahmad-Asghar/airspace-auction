"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation, sendMessage } from '@/services/messagingService';

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

    setLoading(true);
    try {
      // Create or get conversation
      const conversationId = await getOrCreateConversation(
        user.uid,
        adOwnerId,
        listingId,
        listingData
      );

      if (conversationId) {
        // Navigate to messages page with conversation
        router.push(`/messages?conversation=${conversationId}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
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
      <MessageSquare className="h-4 w-4" />
      <span>{loading ? 'Starting...' : 'Send Message'}</span>
    </Button>
  );
}
