
'use client';

import { useActionState, useEffect, useRef, startTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContributionFormSchema, type ContributionFormValues } from './ContributionFormSchema';
import { submitContribution } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, User as UserIcon, Loader2, Info } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@auth0/nextjs-auth0/client'; // Import useUser

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
      Submit Contribution
    </Button>
  );
}

interface ContributionFormProps {
  tripId?: string;
  tripName?: string;
}

export function ContributionForm({ tripId, tripName }: ContributionFormProps) {
  const [state, formAction] = useActionState(submitContribution, { message: '', errors: {} });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useUser(); // Get user from Auth0

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(ContributionFormSchema),
    defaultValues: {
      tripId: tripId || '',
      username: '', // Default to empty
      amount: undefined,
      screenshot: undefined,
    },
  });

  useEffect(() => {
    if (tripId) {
      form.setValue('tripId', tripId);
    }
  }, [tripId, form]);

  // Effect to pre-fill username if user is logged in
  useEffect(() => {
    if (user && user.name) {
      form.setValue('username', user.name);
    }
  }, [user, form]);

  useEffect(() => {
    if (state?.message) {
      if (Object.keys(state.errors ?? {}).length === 0 && state.message.includes('success')) {
        toast({
          title: "Success!",
          description: state.message,
        });
        form.reset({ tripId: tripId || '', username: user?.name || '', amount: undefined, screenshot: undefined });
        if (formRef.current) formRef.current.reset();
      } else {
         toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast, form, tripId, user]);

  const onSubmit = (data: ContributionFormValues) => {
    if (!data.tripId) {
      toast({ title: "Error", description: "No trip selected for contribution.", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append('tripId', data.tripId);
    formData.append('username', data.username);
    formData.append('amount', data.amount.toString());
    if (data.screenshot && data.screenshot.length > 0) {
      formData.append('screenshot', data.screenshot[0]);
    }
    startTransition(() => {
      formAction(formData);
    });
  };
  
  if (!tripId) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Add Your Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-primary/50 text-primary">
            <Info className="h-4 w-4 !text-primary" />
            <AlertTitle>No Trip Selected</AlertTitle>
            <AlertDescription>
              Please select a trip from the dropdown above to make a contribution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Add Contribution to {tripName || 'Selected Trip'}</CardTitle>
        <CardDescription>Fill in the details of your contribution and upload a screenshot for verification.</CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} action={formAction} >
        <input type="hidden" {...form.register('tripId')} value={tripId} />
        {form.formState.errors.tripId && <p className="px-6 text-sm text-destructive">{form.formState.errors.tripId.message}</p>}
        {state?.errors?.tripId && <p className="px-6 text-sm text-destructive">{state.errors.tripId[0]}</p>}
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-1"><UserIcon className="h-4 w-4 text-muted-foreground" />Username</Label>
            <Input 
              id="username" 
              placeholder="Your Name" 
              {...form.register('username')}
            />
            {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
            {state?.errors?.username && <p className="text-sm text-destructive">{state.errors.username[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="500" 
              {...form.register('amount')}
              step="0.01"
            />
            {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
            {state?.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="screenshot" className="flex items-center gap-1"><UploadCloud className="h-4 w-4 text-muted-foreground" />Payment Screenshot</Label>
            <Input 
              id="screenshot" 
              type="file" 
              accept="image/jpeg,image/png,image/webp"
              {...form.register('screenshot')}
            />
            {form.formState.errors.screenshot && <p className="text-sm text-destructive">{form.formState.errors.screenshot.message}</p>}
             {state?.errors?.screenshot && <p className="text-sm text-destructive">{state.errors.screenshot[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
       {state?.message && Object.keys(state.errors ?? {}).length > 0 && (
        <p className="p-4 text-sm text-destructive text-center">{state.message}</p>
      )}
    </Card>
  );
}
