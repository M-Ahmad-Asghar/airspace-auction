"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowRight,
  Download,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Bell,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  item: string;
  cost: number;
  status: 'completed' | 'pending' | 'failed';
  invoiceUrl?: string;
}

interface Subscription {
  plan: string;
  nextBillingDate: string;
  amount: number;
  status: 'active' | 'cancelled' | 'expired';
}

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [monthlyNotifications, setMonthlyNotifications] = useState(true);
  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'Premium Plan',
    nextBillingDate: 'March 15, 2025',
    amount: 29.99,
    status: 'active'
  });
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2025-02-25',
      item: 'Featured Ad Upgrade',
      cost: 49.99,
      status: 'completed'
    },
    {
      id: '2',
      date: '2025-02-25',
      item: 'Featured Ad Upgrade',
      cost: 49.99,
      status: 'completed'
    },
    {
      id: '3',
      date: '2025-02-25',
      item: 'Featured Ad Upgrade',
      cost: 49.99,
      status: 'completed'
    },
    {
      id: '4',
      date: '2025-02-25',
      item: 'Featured Ad Upgrade',
      cost: 49.99,
      status: 'completed'
    },
    {
      id: '5',
      date: '2025-02-25',
      item: 'Featured Ad Upgrade',
      cost: 49.99,
      status: 'completed'
    }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadInvoice = (transactionId: string) => {
    toast({
      title: "Download Started",
      description: "Your invoice is being downloaded.",
    });
  };

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Available",
      description: "Contact support to upgrade your plan.",
    });
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will end on March 15, 2025.",
      variant: "destructive",
    });
  };

  const handleManagePaymentMethods = () => {
    router.push('/admin/payment-methods');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Payments & Subscriptions</h1>
          <Button onClick={() => router.push('/admin')} variant="ghost" size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments & Subscriptions</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Monthly Billing Notifications</span>
            <Switch
              checked={monthlyNotifications}
              onCheckedChange={setMonthlyNotifications}
            />
          </div>
          <Button onClick={() => router.push('/admin')} variant="ghost" size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Billing Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Subscription</span>
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">{subscription.plan}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Next Billing Date</span>
                  </div>
                  <span className="text-sm font-medium">{subscription.nextBillingDate}</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    ${subscription.amount}/month
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleDownloadInvoice}
                variant="outline" 
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF Download
              </Button>
              <Button 
                onClick={handleManagePaymentMethods}
                variant="ghost" 
                className="w-full justify-start"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Recent Transactions</span>
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{transaction.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{transaction.item}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">
                          ${transaction.cost}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          transaction.status === 'completed' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : transaction.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {transaction.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {transaction.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {transaction.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleDownloadInvoice(transaction.id)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button 
          onClick={handleUpgrade}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Upgrade</span>
        </Button>
        <Button 
          onClick={handleCancelSubscription}
          variant="outline"
          className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <AlertCircle className="h-4 w-4" />
          <span>Cancel Subscription</span>
        </Button>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Secure Payments</h3>
                <p className="text-xs text-gray-500">SSL encrypted transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Auto Renewal</h3>
                <p className="text-xs text-gray-500">Never miss a payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Notifications</h3>
                <p className="text-xs text-gray-500">Stay informed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
