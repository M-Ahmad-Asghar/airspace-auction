"use client";

import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Linkedin,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  copyToClipboard, 
  shareViaWebAPI, 
  shareViaEmail, 
  shareViaWhatsApp, 
  shareViaFacebook, 
  shareViaTwitter, 
  shareViaLinkedIn,
  trackShare,
  generateShareContent 
} from '@/services/sharingService';

interface ShareComponentProps {
  listing: any;
  className?: string;
}

export function ShareComponent({ listing, className = '' }: ShareComponentProps) {
  const { user } = useAuth();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (method: string, platform?: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to share listings.",
        variant: "destructive",
      });
      return;
    }

    try {
      let success = false;
      const shareContent = generateShareContent(listing);

      switch (method) {
        case 'copy':
          success = await copyToClipboard(shareContent.url);
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
              title: "Link Copied",
              description: "Listing link has been copied to clipboard.",
            });
          }
          break;

        case 'web_share':
          success = await shareViaWebAPI(listing, user);
          if (success) {
            toast({
              title: "Shared",
              description: "Listing shared successfully!",
            });
          }
          break;

        case 'email':
          window.open(shareViaEmail(listing), '_blank');
          success = true;
          break;

        case 'whatsapp':
          window.open(shareViaWhatsApp(listing), '_blank');
          success = true;
          break;

        case 'facebook':
          window.open(shareViaFacebook(listing), '_blank');
          success = true;
          break;

        case 'twitter':
          window.open(shareViaTwitter(listing), '_blank');
          success = true;
          break;

        case 'linkedin':
          window.open(shareViaLinkedIn(listing), '_blank');
          success = true;
          break;

        default:
          success = false;
      }

      // Track the share
      if (success) {
        await trackShare(
          listing.id,
          listing.title,
          user.displayName || user.email?.split('@')[0] || 'Anonymous',
          user.email || '',
          method as any,
          platform
        );
      }

      setShowShareMenu(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareOptions = [
    {
      id: 'copy',
      label: 'Copy Link',
      icon: copied ? Check : Copy,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    {
      id: 'web_share',
      label: 'Share',
      icon: Share2,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50',
      condition: () => navigator.share
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'text-red-600',
      bgColor: 'hover:bg-red-50'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      bgColor: 'hover:bg-blue-50'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'hover:bg-blue-50'
    }
  ];

  const visibleOptions = shareOptions.filter(option => 
    !option.condition || option.condition()
  );

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="relative"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <Card className="absolute top-12 right-0 z-20 w-64 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">Share this listing</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {visibleOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Button
                        key={option.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(option.id)}
                        className={`justify-start gap-2 ${option.bgColor}`}
                      >
                        <IconComponent className={`h-4 w-4 ${option.color}`} />
                        <span className="text-sm">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Share Stats */}
                <div className="pt-3 border-t mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Share this listing</span>
                    <Badge variant="outline" className="text-xs">
                      {listing.shares || 0} shares
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Simple share button for inline use
export function ShareButton({ listing, className = '' }: ShareComponentProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleQuickShare = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to share listings.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Try Web Share API first (mobile)
      if (navigator.share) {
        const success = await shareViaWebAPI(listing, user);
        if (success) {
          toast({
            title: "Shared",
            description: "Listing shared successfully!",
          });
          return;
        }
      }

      // Fallback to copy link
      const shareContent = generateShareContent(listing);
      const success = await copyToClipboard(shareContent.url);
      
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link Copied",
          description: "Listing link has been copied to clipboard.",
        });

        // Track the share
        await trackShare(
          listing.id,
          listing.title,
          user.displayName || user.email?.split('@')[0] || 'Anonymous',
          user.email || '',
          'copy_link'
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleQuickShare}
      className={className}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </Button>
  );
}
