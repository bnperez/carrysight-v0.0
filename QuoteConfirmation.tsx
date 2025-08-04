import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, FileText, Mail, Phone, Truck, AlertCircle, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Quote {
  quoteReference: string;
  origin: string;
  destination: string;
  mode: string;
  currency: string;
  totalCost: number;
  customerEmail: string;
  acceptedAt?: string;
  salesperson?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface QuoteConfirmationProps {
  quoteId: string;
  token: string;
}

export function QuoteConfirmation({ quoteId, token }: QuoteConfirmationProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 QuoteConfirmation component mounted');
    console.log('Quote ID:', quoteId, 'Token:', token);
    loadQuoteDetails();
  }, [quoteId, token]);

  const loadQuoteDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📡 Loading quote details...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c41ebbe0/quotes/${quoteId}/${token}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Quote details response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to load quote details:', errorText);
        throw new Error(`Failed to load quote details: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Quote details loaded:', data);
      
      setQuote(data.quote);
      setConfirmed(data.quote?.status === 'accepted');
    } catch (err) {
      console.error('❌ Error loading quote details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quote details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmQuote = async () => {
    try {
      setIsConfirming(true);
      setError(null);
      
      console.log('📡 Confirming quote...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c41ebbe0/quotes/${quoteId}/${token}/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Quote confirmation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to confirm quote:', errorText);
        throw new Error(`Failed to confirm quote: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Quote confirmed successfully:', data);
      
      setConfirmed(true);
      if (data.quote) {
        setQuote(data.quote);
      }
    } catch (err) {
      console.error('❌ Error confirming quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to confirm quote');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="mb-2">Loading Quote Details...</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we load your quote information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <h2 className="text-red-900 mb-2">Error Loading Quote</h2>
            <p className="text-sm text-red-800 mb-4">{error}</p>
            <Button 
              onClick={loadQuoteDetails}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-yellow-900 mb-2">Quote Not Found</h2>
            <p className="text-sm text-yellow-800">
              The quote you're looking for could not be found or may have expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-gradient-turquoise-blue mb-2">Carrysight</h1>
            <p className="text-muted-foreground">Freight Quote Confirmation</p>
          </div>

          {/* Confirmation Status */}
          {confirmed ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-green-900 mb-2">Quote Accepted Successfully!</h2>
                    <p className="text-green-800 mb-4">
                      Thank you for accepting our freight quote <strong>{quoteId}</strong>. 
                      We've sent you a confirmation email with next steps and required documents.
                    </p>
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      Quote Confirmed at {new Date().toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-blue-900 mb-2">Confirm Your Freight Quote</h2>
                    <p className="text-blue-800 mb-4">
                      Please review the quote details below and click "Accept Quote" to proceed with your shipment.
                    </p>
                    <Button 
                      onClick={handleConfirmQuote}
                      disabled={isConfirming}
                      className="btn-turquoise-solid"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        'Accept Quote'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quote Details */}
          {quote && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quote Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quote Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quote Reference:</span>
                      <div className="font-medium">{quote.quoteReference}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div>
                        <Badge className={confirmed ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}>
                          {confirmed ? 'Accepted' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Route:</span>
                      <div className="font-medium">{quote.origin} → {quote.destination}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Service:</span>
                      <div className="font-medium">{quote.mode}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Cost:</span>
                      <div className="font-medium text-lg">
                        {quote.currency} {quote.totalCost?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confirmed:</span>
                      <div className="font-medium">
                        {quote.acceptedAt ? new Date(quote.acceptedAt).toLocaleDateString() : (confirmed ? 'Just now' : 'Not yet')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salesperson Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Your Dedicated Salesperson
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-turquoise-light rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-semibold text-turquoise-foreground">
                        {quote.salesperson?.name?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <h4 className="font-semibold">{quote.salesperson?.name || 'Carrysight Team'}</h4>
                    <p className="text-sm text-muted-foreground mb-4">Freight Specialist</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">
                          {quote.salesperson?.email || 'team@carrysight.com'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">
                          {quote.salesperson?.phone || '+1-555-CARRYSIGHT'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your salesperson will contact you within 24 hours to discuss the next steps.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                What Happens Next?
              </CardTitle>
              <CardDescription>
                Follow these steps to complete your shipment booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-turquoise-light rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-turquoise-foreground">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Check Your Email</h4>
                    <p className="text-sm text-muted-foreground">
                      We've sent a detailed email to <strong>{quote?.customerEmail}</strong> with a list of required documents and information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-light rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-foreground">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Prepare Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Gather the required documents including commercial invoice, packing list, and any special permits.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-turquoise-light rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-turquoise-foreground">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Salesperson Contact</h4>
                    <p className="text-sm text-muted-foreground">
                      Your dedicated salesperson will contact you within 24 hours to review requirements and finalize details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="h-4 w-4 text-blue-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Routing Instruction</h4>
                    <p className="text-sm text-muted-foreground">
                      Once all documents are received and verified, we'll issue your routing instruction to begin the shipment process.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions or need assistance, don't hesitate to reach out to your salesperson or our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <a href={`mailto:${quote?.salesperson?.email || 'team@carrysight.com'}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Salesperson
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`tel:${quote?.salesperson?.phone || '+1-555-CARRYSIGHT'}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
