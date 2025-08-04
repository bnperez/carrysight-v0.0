import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, Mail, Phone, Clock, ArrowRight, FileText, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner@2.0.3";
import logoImage from "figma:asset/c2bc6af4ad20962b0ae56b912ca8583b4062e1d5.png";
import { projectId } from '../utils/supabase/info';

interface QuoteConfirmationProps {
  quoteId: string;
  token: string;
}

interface Quote {
  id: string;
  quoteReference: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  salesperson: {
    name: string;
    email: string;
    phone: string;
  };
  origin: string;
  destination: string;
  mode: string;
  totalCost: number;
  currency: string;
  acceptedAt?: string;
}

export function QuoteConfirmation({ quoteId, token }: QuoteConfirmationProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmQuote = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('=== QUOTE CONFIRMATION START ===');
        console.log('Quote confirmation request:', { 
          quoteId, 
          token: token.substring(0, 8) + '...',
          fullTokenLength: token.length 
        });

        // Call the confirmation endpoint
        const confirmUrl = `https://${projectId}.supabase.co/functions/v1/make-server-c41ebbe0/quotes/${quoteId}/${token}/confirm`;
        console.log('Calling confirmation URL:', confirmUrl);

        const response = await fetch(confirmUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
          // NO Authorization header needed - endpoint is now public with token validation
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          console.error('Parsed error data:', errorData);
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to confirm quote`);
        }

        const resultText = await response.text();
        console.log('Raw success response:', resultText);
        
        let result;
        try {
          result = JSON.parse(resultText);
        } catch (parseError) {
          console.error('Failed to parse success response as JSON:', parseError);
          throw new Error('Invalid response format from server');
        }

        console.log('Parsed result:', result);
        
        if (result.success) {
          setQuote(result.quote);
          setIsConfirmed(true);
          toast.success('Quote confirmed successfully!');
          console.log('✅ Quote confirmation successful');
        } else {
          throw new Error(result.error || 'Quote confirmation failed');
        }

      } catch (error) {
        console.error('❌ Quote confirmation error:', error);
        console.error('Error stack:', error.stack);
        setError(error.message || 'Failed to confirm quote');
        toast.error('Failed to confirm quote');
      } finally {
        setIsLoading(false);
        console.log('=== QUOTE CONFIRMATION END ===');
      }
    };

    if (quoteId && token) {
      console.log('Starting quote confirmation process...');
      confirmQuote();
    } else {
      console.error('Missing quoteId or token:', { quoteId, token });
      setError('Invalid confirmation link - missing quote ID or token');
      setIsLoading(false);
    }
  }, [quoteId, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="relative mb-6">
                <img 
                  src={logoImage} 
                  alt="Carrysight Logo" 
                  className="h-12 w-auto mx-auto opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin opacity-75" />
                </div>
              </div>
              <h3 className="mb-2">Confirming Quote</h3>
              <p className="text-muted-foreground">
                Please wait while we process your quote confirmation...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-red-900">Confirmation Failed</h3>
              <p className="text-red-700 mb-4">
                {error}
              </p>
              <p className="text-sm text-muted-foreground">
                If you continue to experience issues, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Carrysight" className="h-8 w-auto" />
            <div>
              <h1 className="text-xl">Quote Confirmed</h1>
              <p className="text-sm text-muted-foreground">Modernizing Freight</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Success Banner */}
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
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Accepted
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
                        {quote.acceptedAt ? new Date(quote.acceptedAt).toLocaleDateString() : 'Just now'}
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
