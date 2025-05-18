
'use client';

import { useActionState, useEffect, useRef, startTransition, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTripFormSchema, type CreateTripFormValues } from './CreateTripFormSchema';
import { createTrip } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaneTakeoff, FileText, Loader2, Info, ScanLine, CreditCard, CheckCircle2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlaneTakeoff className="mr-2 h-4 w-4" />}
      Create Trip
    </Button>
  );
}

const initialFormState = { message: '', errors: {}, tripId: undefined, tripName: undefined };

export function CreateTripForm() {
  const { user, isLoading: isUserLoading } = useUser();
  const [state, formAction] = useActionState(createTrip, initialFormState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [newTripUrl, setNewTripUrl] = useState('');
  const [createdTripName, setCreatedTripName] = useState('');


  const form = useForm<CreateTripFormValues>({
    resolver: zodResolver(CreateTripFormSchema),
    defaultValues: {
      name: '',
      description: '',
      goalAmount: undefined,
      upiId: '',
      qrCodeImage: undefined,
    },
  });

  useEffect(() => {
    if (state?.message) {
      if (state.tripId && state.message.includes('success')) {
        // Success toast is handled by the dialog now
        const url = `${window.location.origin}/trips?tripId=${state.tripId}`;
        setNewTripUrl(url);
        setCreatedTripName(state.tripName || 'Your new trip');
        setIsSuccessDialogOpen(true);
        form.reset(); 
        if (formRef.current) formRef.current.reset();
      } else if (Object.keys(state.errors ?? {}).length > 0 || !state.message.includes('success')) {
         toast({
          title: "Error Creating Trip",
          description: state.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  }, [state, toast, form]);
  
  const onSubmit = (data: CreateTripFormValues) => {
    if (!user && !isUserLoading) {
      toast({ title: "Login Required", description: "You must be logged in to create a trip.", variant: "destructive" });
      return;
    }
    const formData = new FormData(formRef.current!);
    // react-hook-form handles FileList, ensure only the first file is appended if one exists
    if (data.qrCodeImage && data.qrCodeImage.length > 0) {
      formData.set('qrCodeImage', data.qrCodeImage[0]);
    } else {
      // If no file is selected (optional field), ensure it's not in formData or is explicitly empty
      formData.delete('qrCodeImage'); 
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  const handleCopyUrl = async () => {
    if (!newTripUrl) return;
    try {
      await navigator.clipboard.writeText(newTripUrl);
      toast({
        title: 'URL Copied!',
        description: 'Trip URL copied to clipboard.',
        className: "bg-primary text-primary-foreground",
      });
    } catch (err) {
      toast({
        title: 'Failed to Copy',
        description: 'Could not copy URL. Please try manually.',
        variant: 'destructive',
      });
    }
  };


  if (isUserLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading user information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Trip</CardTitle>
          <CardDescription>Define a new savings goal for your group, including optional payment details.</CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="default" className="border-primary/50 text-primary">
              <Info className="h-4 w-4 !text-primary" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                Please <a href="/api/auth/login" className="underline font-semibold hover:text-primary/80">login</a> to create a new savings trip.
              </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Trip</CardTitle>
          <CardDescription>Define a new savings goal, {user.email}. Includes optional payment details.</CardDescription>
        </CardHeader>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} action={formAction} >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground" />Trip Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Bali Adventure 2025" 
                {...form.register('name')}
              />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground" />Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Briefly describe the trip or savings goal."
                {...form.register('description')}
              />
              {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
              {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalAmount">Goal Amount (₹) (Optional)</Label>
              <Input 
                id="goalAmount" 
                type="number" 
                placeholder="200000" 
                {...form.register('goalAmount')}
                step="100"
              />
              {form.formState.errors.goalAmount && <p className="text-sm text-destructive">{form.formState.errors.goalAmount.message}</p>}
              {state?.errors?.goalAmount && <p className="text-sm text-destructive">{state.errors.goalAmount[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiId" className="flex items-center gap-1"><CreditCard className="h-4 w-4 text-muted-foreground" />UPI ID (Optional)</Label>
              <Input 
                id="upiId" 
                placeholder="yourname@upi" 
                {...form.register('upiId')}
              />
              {form.formState.errors.upiId && <p className="text-sm text-destructive">{form.formState.errors.upiId.message}</p>}
              {state?.errors?.upiId && <p className="text-sm text-destructive">{state.errors.upiId[0]}</p>}
            </div>
              <div className="space-y-2">
              <Label htmlFor="qrCodeImage" className="flex items-center gap-1"><ScanLine className="h-4 w-4 text-muted-foreground" />QR Code Image (Optional)</Label>
              <Input 
                id="qrCodeImage" 
                type="file" 
                accept="image/jpeg,image/png,image/webp"
                {...form.register('qrCodeImage')}
              />
              {form.formState.errors.qrCodeImage && <p className="text-sm text-destructive">{form.formState.errors.qrCodeImage.message}</p>}
              {state?.errors?.qrCodeImage && <p className="text-sm text-destructive">{state.errors.qrCodeImage[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
        {state?.message && Object.keys(state.errors ?? {}).length > 0 && !state.tripId && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
      </Card>

      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl">
              <CheckCircle2 className="h-6 w-6 mr-2 text-green-500" />
              Trip Created Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your new trip "<strong>{createdTripName}</strong>" is ready. You can share the link below or view it now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 space-y-3">
            <Label htmlFor="trip-url" className="text-sm font-medium">Trip URL:</Label>
            <div className="flex items-center space-x-2">
              <Input id="trip-url" type="text" value={newTripUrl} readOnly className="flex-1" />
              <Button type="button" size="sm" variant="outline" onClick={handleCopyUrl} className="px-3">
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <AlertDialogFooter className="mt-6 sm:justify-between">
            <Button variant="outline" onClick={() => setIsSuccessDialogOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href={newTripUrl}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Trip
              </Link>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

