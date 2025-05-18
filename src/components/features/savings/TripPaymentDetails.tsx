
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ScanLine, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TripPaymentDetailsProps {
  upiId?: string;
  qrCodeImageUrl?: string;
  tripName?: string;
}

export function TripPaymentDetails({ upiId, qrCodeImageUrl, tripName }: TripPaymentDetailsProps) {
  const { toast } = useToast();

  const handleCopyUpiId = async () => {
    if (!upiId) return;
    try {
      await navigator.clipboard.writeText(upiId);
      toast({
        title: 'UPI ID Copied!',
        description: `${upiId} has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: 'Failed to Copy',
        description: 'Could not copy UPI ID to clipboard. Please try manually.',
        variant: 'destructive',
      });
      console.error('Failed to copy UPI ID: ', err);
    }
  };

  if (!upiId && !qrCodeImageUrl) {
    return (
        <Alert variant="default" className="mb-6 border-primary/30 text-primary/90">
            <Info className="h-4 w-4 !text-primary/90" />
            <AlertTitle>Payment Information Not Available</AlertTitle>
            <AlertDescription>
                The admin has not yet provided UPI ID or QR code for {tripName || 'this trip'}.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Card className="mb-8 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <ScanLine className="mr-2 h-6 w-6 text-primary" />
          Payment Details for {tripName || 'Selected Trip'}
        </CardTitle>
        <CardDescription>Use the details below to make your contribution.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {qrCodeImageUrl && (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Scan QR Code:</p>
            <div className="relative w-48 h-48 md:w-56 md:h-56 border rounded-md overflow-hidden shadow-sm">
              <Image
                src={qrCodeImageUrl}
                alt={`QR Code for ${tripName || 'trip payment'}`}
                layout="fill"
                objectFit="contain"
                data-ai-hint="qr code"
              />
            </div>
          </div>
        )}
        {upiId && (
          <div className={`flex flex-col items-center space-y-3 ${!qrCodeImageUrl ? 'md:col-span-2' : ''}`}>
            <p className="text-sm font-medium text-muted-foreground">Or use UPI ID:</p>
            <div className="p-3 bg-muted rounded-md text-center w-full max-w-xs">
              <p className="text-lg font-semibold text-primary break-all">{upiId}</p>
            </div>
            <Button onClick={handleCopyUpiId} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy UPI ID
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
