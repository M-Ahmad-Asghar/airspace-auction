"use client";

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  addRating, 
  getListingRatings, 
  getListingRatingStats, 
  hasUserRated, 
  getUserRating,
  type Rating,
  type ListingRatingStats 
} from '@/services/ratingService';
import { formatDistanceToNow } from 'date-fns';

interface RatingComponentProps {
  listingId: string;
  listingTitle: string;
}

export function RatingComponent({ listingId, listingTitle }: RatingComponentProps) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingStats, setRatingStats] = useState<ListingRatingStats>({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  // Rating form state
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadRatingData();
  }, [listingId, user]);

  const loadRatingData = async () => {
    if (!listingId) return;
    
    setLoading(true);
    try {
      const [ratingsData, statsData] = await Promise.all([
        getListingRatings(listingId, 20),
        getListingRatingStats(listingId)
      ]);
      
      setRatings(ratingsData);
      setRatingStats(statsData);
      
      if (user) {
        const userHasRated = await hasUserRated(listingId, user.uid);
        setHasRated(userHasRated);
        
        if (userHasRated) {
          const userRatingData = await getUserRating(listingId, user.uid);
          setUserRating(userRatingData);
        }
      }
    } catch (error) {
      console.error('Error loading rating data:', error);
      toast({
        title: "Error",
        description: "Failed to load ratings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user || newRating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await addRating(
        listingId,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Anonymous',
        user.photoURL || undefined,
        newRating,
        newComment.trim() || undefined
      );

      if (success) {
        toast({
          title: "Success",
          description: "Thank you for your rating!",
        });
        
        // Reset form
        setNewRating(0);
        setNewComment('');
        setShowRatingForm(false);
        
        // Reload data
        await loadRatingData();
      } else {
        toast({
          title: "Error",
          description: "Failed to submit rating. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingDistribution = () => {
    const total = ratingStats.totalRatings;
    if (total === 0) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratingStats.ratingDistribution[stars as keyof typeof ratingStats.ratingDistribution];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm w-6">{stars}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Ratings & Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Ratings & Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {ratingStats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(ratingStats.averageRating), 'lg')}
              </div>
              <div className="text-sm text-gray-600">
                Based on {ratingStats.totalRatings} review{ratingStats.totalRatings !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="font-semibold mb-3">Rating Breakdown</h4>
              {renderRatingDistribution()}
            </div>
          </div>

          {/* Rate Button */}
          {user && !hasRated && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={() => setShowRatingForm(true)}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Rate this listing
              </Button>
            </div>
          )}

          {/* User's Rating */}
          {user && hasRated && userRating && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Your Rating:</span>
                <div className="flex">
                  {renderStars(userRating.rating, 'sm')}
                </div>
              </div>
              {userRating.comment && (
                <p className="text-sm text-gray-600 italic">"{userRating.comment}"</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Form */}
      {showRatingForm && (
        <Card>
          <CardHeader>
            <CardTitle>Rate this listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setNewRating(stars)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        stars <= newRating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">Comment (optional)</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this listing..."
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitRating}
                disabled={submitting || newRating === 0}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRatingForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 !size-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={rating.userAvatar} alt={rating.userName} />
                      <AvatarFallback>{rating.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rating.userName}</span>
                        <div className="flex">
                          {renderStars(rating.rating, 'sm')}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(rating.createdAt?.seconds * 1000), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {rating.comment && (
                        <p className="text-sm text-gray-700 mt-1">{rating.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
