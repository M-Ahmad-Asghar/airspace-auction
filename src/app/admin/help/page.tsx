"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  FileText,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function HelpPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    description: '',
    priority: 'medium'
  });

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create a new listing?',
      answer: 'To create a new listing, click the "Post" button in the header, select your category, and fill out the required information including photos, description, and pricing.',
      category: 'Listings'
    },
    {
      id: '2',
      question: 'How do I edit my profile?',
      answer: 'Go to Account Settings in your profile dropdown menu. You can update your personal information, contact details, and preferences there.',
      category: 'Account'
    },
    {
      id: '3',
      question: 'How do I save searches?',
      answer: 'When you perform a search on the home page, click the "Save This Search" button to save your current search criteria for future use.',
      category: 'Search'
    },
    {
      id: '4',
      question: 'How do I manage my billing?',
      answer: 'Go to Billing & Payments in your profile menu to view your subscription, payment methods, and transaction history.',
      category: 'Billing'
    },
    {
      id: '5',
      question: 'How do I contact support?',
      answer: 'You can contact support through this help page by submitting a ticket, or reach out via email at support@airplanedeals.com.',
      category: 'Support'
    }
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: '1',
      subject: 'Listing not appearing in search results',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2025-02-20'
    },
    {
      id: '2',
      subject: 'Payment method not working',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2025-02-22'
    },
    {
      id: '3',
      subject: 'Account verification issue',
      status: 'open',
      priority: 'low',
      createdAt: '2025-02-24'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the subject and description fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingTicket(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Ticket Submitted",
        description: "Your support ticket has been submitted successfully. We'll get back to you within 24 hours.",
      });
      
      setTicketForm({
        subject: '',
        category: '',
        description: '',
        priority: 'medium'
      });
      setShowContactForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingTicket(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Support & Help</h1>
        <Button onClick={() => router.push('/admin')} variant="ghost" size="sm">
          <ArrowRight className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowContactForm(true)}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5  !size-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Submit Ticket</h3>
                <p className="text-xs text-gray-500">Get help with your issue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Call Support</h3>
                <p className="text-xs text-gray-500">+1 (555) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Email Support</h3>
                <p className="text-xs text-gray-500">support@airplanedeals.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-2">{faq.question}</h3>
                      <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5  !size-5" />
            <span>Your Support Tickets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{ticket.subject}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {ticket.status === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
                      {ticket.status === 'open' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} priority
                    </Badge>
                    <span className="text-xs text-gray-500">{ticket.createdAt}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      {showContactForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 !size-5" />
              <span>Submit Support Ticket</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Technical, Billing, Account"
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Please provide detailed information about your issue..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={() => setShowContactForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitTicket}
                disabled={submittingTicket}
                className="flex items-center space-x-2"
              >
                {submittingTicket && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Submit Ticket</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Documentation</h3>
                <p className="text-xs text-gray-500">User guides and tutorials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Video className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Video Tutorials</h3>
                <p className="text-xs text-gray-500">Step-by-step videos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">API Documentation</h3>
                <p className="text-xs text-gray-500">Developer resources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
