
import { getAllContributions, getStats, getAllTripsForCurrentUser, deleteContribution } from '@/lib/actions';
import { PageHeader } from '@/components/features/savings/PageHeader';
import { StatsDisplay } from '@/components/features/savings/StatsDisplay';
import { ContributionForm } from '@/components/features/savings/ContributionForm';
import { RequestsTable } from '@/components/features/savings/RequestsTable';
import { Separator } from '@/components/ui/separator';
import { TripSelector } from '@/components/features/savings/TripSelector';
import { TripPaymentDetails } from '@/components/features/savings/TripPaymentDetails';
import type { Trip, Contribution, ContributionStats, SerializableTrip, SerializableContribution, SerializableContributionStats } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Settings, LogIn, Users } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientOnlyCurrentYear } from '@/components/shared/CurrentYear';
import { LandingPageHeader } from '@/components/layout/LandingPageHeader';
import { getSession } from '@auth0/nextjs-auth0';

interface TripsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const session = await getSession();
  const user = session?.user;

  // getAllTripsForCurrentUser will now return all trips if user is not logged in
  const dbTrips = await getAllTripsForCurrentUser();
  const serializableTrips: SerializableTrip[] = dbTrips.map(trip => ({
    _id: trip._id.toString(),
    userId: trip.userId,
    userEmail: trip.userEmail,
    name: trip.name,
    description: trip.description ?? undefined,
    goalAmount: trip.goalAmount ?? undefined,
    upiId: trip.upiId,
    qrCodeImageUrl: trip.qrCodeImageUrl,
    createdAt: trip.createdAt.toISOString(),
  }));

  const initialTripIdFromParams = searchParams?.tripId as string | undefined;
  let currentSerializableTrip: SerializableTrip | null = null;
  let activeTripId: string | undefined = undefined;

  if (initialTripIdFromParams) {
    const foundTrip = serializableTrips.find(t => t._id === initialTripIdFromParams);
    if (foundTrip) {
      currentSerializableTrip = foundTrip;
      activeTripId = initialTripIdFromParams;
    }
  }

  if (!currentSerializableTrip && serializableTrips.length > 0) {
    currentSerializableTrip = serializableTrips[0];
    activeTripId = currentSerializableTrip._id;
  }

  const isTripOwner = user && currentSerializableTrip && currentSerializableTrip.userId === user.sub;

  const [dbStats, dbRequests] = await Promise.all([
    activeTripId ? getStats(activeTripId) : Promise.resolve({ totalAmount: 0, contributionsByUser: [] as {username: string, total: number}[] } as ContributionStats),
    activeTripId ? getAllContributions(activeTripId) : Promise.resolve([] as Contribution[]),
  ]);

  const serializableStats: SerializableContributionStats = {
    ...dbStats,
    tripId: dbStats.tripId?.toString(),
    tripName: dbStats.tripName,
  };

  const serializableRequests: SerializableContribution[] = dbRequests.map(req => ({
    ...req,
    _id: req._id.toString(),
    tripId: req.tripId.toString(),
    createdAt: req.createdAt.toISOString(),
    approvedAt: req.approvedAt ? req.approvedAt.toISOString() : undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingPageHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <PageHeader title="Explore Savings Trips" />

        {!user && (
          <Alert variant="default" className="mb-10 border-primary/50 text-primary">
            <Users className="h-4 w-4 !text-primary" />
            <AlertTitle>Welcome, Guest!</AlertTitle>
            <AlertDescription>
              You are viewing publicly available trips. <a href="/api/auth/login" className="underline font-semibold hover:text-primary/80">Login</a> to create and manage your own trips.
            </AlertDescription>
          </Alert>
        )}

        {user && serializableTrips.filter(t => t.userId === user.sub).length === 0 && (
           <Alert variant="default" className="mb-10 border-primary/50 text-primary">
            <Info className="h-4 w-4 !text-primary" />
            <AlertTitle>No Trips Created Yet!</AlertTitle>
            <AlertDescription>
              You haven't created any savings trips.
              <Button asChild variant="link" className="p-0 h-auto ml-1">
                <Link href="/manage-trips">Go to Manage Trips to Create Your First One <Settings className="ml-1 h-4 w-4"/></Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!user && serializableTrips.length === 0 && (
          <Alert variant="default" className="mb-10">
            <Info className="h-4 w-4" />
            <AlertTitle>No Trips Available</AlertTitle>
            <AlertDescription>
              There are currently no savings trips in the system. Check back later or login to create one!
            </AlertDescription>
          </Alert>
        )}

        {serializableTrips.length > 0 && (
          <TripSelector trips={serializableTrips} currentTripId={activeTripId} />
        )}

        {activeTripId && currentSerializableTrip && (
          <>
            <TripPaymentDetails
              upiId={currentSerializableTrip.upiId}
              qrCodeImageUrl={currentSerializableTrip.qrCodeImageUrl}
              tripName={currentSerializableTrip.name}
            />

            <section id="stats" className="mb-10">
              <StatsDisplay stats={serializableStats} tripGoal={currentSerializableTrip.goalAmount} />
            </section>

            <Separator className="my-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <section id="submit-contribution" className="lg:col-span-1">
                <h2 className="text-2xl font-semibold mb-6 text-center lg:text-left">New Contribution</h2>
                <ContributionForm tripId={activeTripId} tripName={currentSerializableTrip.name} />
              </section>

              <section id="requests" className="lg:col-span-2">
                 <h2 className="text-2xl font-semibold mb-6 text-center lg:text-left">All Requests for {currentSerializableTrip.name}</h2>
                <RequestsTable
                  requests={serializableRequests}
                  tripName={currentSerializableTrip.name}
                  onDelete={deleteContribution}
                  isTripOwner={isTripOwner || false}
                />
              </section>
            </div>
          </>
        )}
         {!activeTripId && serializableTrips.length > 0 && (
             <Alert variant="default" className="mt-10 border-primary/50 text-primary">
                <Info className="h-4 w-4 !text-primary" />
                <AlertTitle>Select a Trip</AlertTitle>
                <AlertDescription>
                Please select a trip from the dropdown above to view its details and make contributions.
                </AlertDescription>
            </Alert>
        )}
      </main>
      <footer className="text-center py-8 border-t mt-12 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Shared Savings Tracker &copy; <ClientOnlyCurrentYear />. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Making group savings simple and transparent.
        </p>
      </footer>
    </div>
  );
}

export const dynamic = 'force-dynamic';
