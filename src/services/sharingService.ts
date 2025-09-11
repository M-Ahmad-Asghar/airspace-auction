import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface ShareData {
  id: string;
  listingId: string;
  listingTitle: string;
  sharedBy: string;
  sharedByEmail: string;
  shareMethod: 'copy_link' | 'social_media' | 'email' | 'whatsapp' | 'other';
  sharePlatform?: string;
  createdAt: any;
}

// Track sharing activity
export async function trackShare(
  listingId: string,
  listingTitle: string,
  sharedBy: string,
  sharedByEmail: string,
  shareMethod: ShareData['shareMethod'],
  sharePlatform?: string
): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase not initialized');
      return false;
    }

    const shareData = {
      listingId,
      listingTitle,
      sharedBy,
      sharedByEmail,
      shareMethod,
      sharePlatform: sharePlatform || null,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'shares'), shareData);
    return true;
  } catch (error) {
    console.error('Error tracking share:', error);
    return false;
  }
}

// Generate shareable content
export function generateShareContent(listing: any): {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
} {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://airplanedeals.com';
  const url = `${baseUrl}/listing/${listing.id}`;
  
  const title = `${listing.title} - ${listing.category}`;
  const description = `Check out this ${listing.category.toLowerCase()} listing: ${listing.title}. Price: $${listing.price?.toLocaleString() || 'Contact for price'}`;
  
  return {
    url,
    title,
    description,
    imageUrl: listing.images?.[0] || listing.imageUrls?.[0]
  };
}

// Copy link to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

// Share via Web Share API (mobile)
export async function shareViaWebAPI(listing: any, user: any): Promise<boolean> {
  try {
    if (!navigator.share) {
      return false;
    }

    const shareContent = generateShareContent(listing);
    
    await navigator.share({
      title: shareContent.title,
      text: shareContent.description,
      url: shareContent.url,
    });

    // Track the share
    await trackShare(
      listing.id,
      listing.title,
      user.displayName || user.email,
      user.email,
      'social_media',
      'web_share_api'
    );

    return true;
  } catch (error) {
    console.error('Error sharing via Web API:', error);
    return false;
  }
}

// Share via email
export function shareViaEmail(listing: any): string {
  const shareContent = generateShareContent(listing);
  const subject = encodeURIComponent(`Check out this ${listing.category.toLowerCase()} listing`);
  const body = encodeURIComponent(`${shareContent.description}\n\nView listing: ${shareContent.url}`);
  
  return `mailto:?subject=${subject}&body=${body}`;
}

// Share via WhatsApp
export function shareViaWhatsApp(listing: any): string {
  const shareContent = generateShareContent(listing);
  const text = encodeURIComponent(`${shareContent.description}\n\n${shareContent.url}`);
  
  return `https://wa.me/?text=${text}`;
}

// Share via Facebook
export function shareViaFacebook(listing: any): string {
  const shareContent = generateShareContent(listing);
  const url = encodeURIComponent(shareContent.url);
  
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
}

// Share via Twitter
export function shareViaTwitter(listing: any): string {
  const shareContent = generateShareContent(listing);
  const text = encodeURIComponent(shareContent.description);
  const url = encodeURIComponent(shareContent.url);
  
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
}

// Share via LinkedIn
export function shareViaLinkedIn(listing: any): string {
  const shareContent = generateShareContent(listing);
  const url = encodeURIComponent(shareContent.url);
  const title = encodeURIComponent(shareContent.title);
  const summary = encodeURIComponent(shareContent.description);
  
  return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
}
