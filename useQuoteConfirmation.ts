import { useState, useEffect } from "react";

interface QuoteConfirmation {
  quoteId: string;
  token: string;
}

export function useQuoteConfirmation() {
  const [quoteConfirmation, setQuoteConfirmation] = useState<QuoteConfirmation | null>(null);

  useEffect(() => {
    const checkQuoteUrl = () => {
      console.log('Checking quote URL - pathname:', window.location.pathname, 'search:', window.location.search);
      
      // First check pathname-based routing: /quote/confirm/[quoteId]/[token]
      const path = window.location.pathname;
      const confirmMatch = path.match(/\/quote\/confirm\/([^\/]+)\/([^\/]+)/);
      
      if (confirmMatch) {
        const [, quoteId, token] = confirmMatch;
        console.log('Found pathname-based quote confirmation:', { quoteId, token: token.substring(0, 8) + '...' });
        setQuoteConfirmation({ quoteId, token });
        return;
      }
      
      // Check query parameter-based routing: /?action=confirm&quote=QT123&token=token123
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get('action');
      const quoteParam = searchParams.get('quote');
      const tokenParam = searchParams.get('token');
      
      if (action === 'confirm' && quoteParam && tokenParam) {
        console.log('Found query-based quote confirmation:', { 
          quoteId: quoteParam, 
          token: tokenParam.substring(0, 8) + '...' 
        });
        setQuoteConfirmation({ quoteId: quoteParam, token: tokenParam });
        return;
      }
      
      console.log('No quote confirmation pattern found');
      setQuoteConfirmation(null);
    };

    checkQuoteUrl();
    
    // Listen for URL changes
    window.addEventListener('popstate', checkQuoteUrl);
    window.addEventListener('hashchange', checkQuoteUrl);
    return () => {
      window.removeEventListener('popstate', checkQuoteUrl);
      window.removeEventListener('hashchange', checkQuoteUrl);
    };
  }, []);

  return quoteConfirmation;
}
