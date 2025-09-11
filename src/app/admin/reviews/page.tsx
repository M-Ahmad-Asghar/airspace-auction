"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  listingTitle: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      reviewerName: 'John Smith',
      reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rating: 5,
      comment: 'Excellent aircraft! Very well maintained and exactly as described. Seller was professional and helpful throughout the process.',
      date: '2025-02-20',
      listingTitle: '2020 Cessna 172 Skyhawk',
      status: 'approved'
    },
    {
      id: '2',
      reviewerName: 'Sarah Johnson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      rating: 4,
      comment: 'Good experience overall. Aircraft was in good condition, though there were some minor discrepancies in the description.',
      date: '2025-02-18',
      listingTitle: '2018 Piper Cherokee',
      status: 'approved'
    },
    {
      id: '3',
      reviewerName: 'Mike Davis',
      reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      rating: 3,
      comment: 'Average experience. Communication could have been better, but the aircraft was delivered as promised.',
      date: '2025-02-15',
      listingTitle: '2015 Beechcraft Bonanza',
      status: 'pending'
    }
  ]);

  const handleApproveReview = async (reviewId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Review Approved",
        description: "The review has been approved and is now visible.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Review Rejected",
        description: "The review has been rejected and will not be displayed.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
        <Button onClick={() => router.push('/admin')} variant="ghost" size="sm">
          <ArrowRight className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Total Reviews</h3>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ThumbsUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Average Rating</h3>
                <p className="text-2xl font-bold">4.2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Pending</h3>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">This Month</h3>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Recent Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={review.reviewerAvatar}
                      alt={review.reviewerName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-sm">{review.reviewerName}</h3>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(review.status)}`}>
                          {review.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        For: <span className="font-medium">{review.listingTitle}</span>
                      </p>
                      
                      {review.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleApproveReview(review.id)}
                            disabled={loading}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectReview(review.id)}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
