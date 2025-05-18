
'use server';

import { getSession } from '@auth0/nextjs-auth0';
import { revalidatePath } from 'next/cache';
import { getContributionsCollection, getTripsCollection, ObjectId } from './mongodb';
import { uploadImage } from './cloudinary';
import type { Contribution, ContributionStats, Trip } from '@/types';
import { z } from 'zod';

// === Trip Actions ===

const CreateTripFormSchemaServer = z.object({
  name: z.string().min(3, "Trip name must be at least 3 characters.").max(100),
  description: z.string().max(500).optional(),
  goalAmount: z.coerce.number().positive("Goal amount must be positive.").optional().or(z.literal('')),
  upiId: z.string().trim().max(100).optional(),
});

export async function createTrip(
  prevState: { message: string; errors: any; tripId?: string; tripName?: string }, 
  formData: FormData
): Promise<{ message: string; errors: any; tripId?: string; tripName?: string }> {
  const session = await getSession();
  if (!session || !session.user) {
    return { message: 'Unauthorized. Please log in to create a trip.', errors: {} };
  }
  const { user } = session;

  const parsedGoalAmount = formData.get('goalAmount');
  const validatedFields = CreateTripFormSchemaServer.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    goalAmount: parsedGoalAmount === '' ? undefined : parsedGoalAmount,
    upiId: formData.get('upiId'),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid trip data.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, description, goalAmount, upiId } = validatedFields.data;

  let qrCodeImageUrl: string | undefined = undefined;
  const qrCodeImageFile = formData.get('qrCodeImage') as File | null;

  if (qrCodeImageFile && qrCodeImageFile.size > 0) {
    if (qrCodeImageFile.size > 2 * 1024 * 1024) { // 2MB
      return { message: "QR Code image must be less than 2MB.", errors: { qrCodeImage: ["QR Code image must be less than 2MB."] } };
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(qrCodeImageFile.type)) {
       return { message: "Only JPG, PNG, WEBP images are allowed for QR Code.", errors: { qrCodeImage: ["Only JPG, PNG, WEBP images are allowed."] } };
    }
    try {
      const fileBuffer = Buffer.from(await qrCodeImageFile.arrayBuffer());
      const fileName = `qr_code_${user.sub}_${Date.now()}-${qrCodeImageFile.name.replace(/\s+/g, '_')}`;
      const uploadResult = await uploadImage(fileBuffer, fileName);
      if (!uploadResult || !uploadResult.secure_url) {
        return { message: 'Failed to upload QR code image to Cloudinary.', errors: {} };
      }
      qrCodeImageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error('Error uploading QR code image:', uploadError);
      return { message: 'Failed to process QR code image upload.', errors: {} };
    }
  }

  try {
    const tripsCollection = await getTripsCollection();
    const newTrip: Omit<Trip, '_id'> = {
      userId: user.sub!, 
      userEmail: user.email || undefined,
      name,
      description: description || undefined,
      goalAmount: goalAmount || undefined,
      upiId: upiId || undefined,
      qrCodeImageUrl: qrCodeImageUrl,
      createdAt: new Date(),
    };
    const result = await tripsCollection.insertOne(newTrip as Trip); 
    
    if (result.insertedId) {
      revalidatePath('/');
      revalidatePath('/trips');
      revalidatePath('/manage-trips');
      return { message: `Trip '${name}' created successfully!`, errors: {}, tripId: result.insertedId.toString(), tripName: name };
    } else {
      return { message: `Failed to create trip: No ID returned from database.`, errors: {} };
    }
  } catch (error) {
    console.error('Error creating trip:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `Failed to create trip: ${errorMessage}`, errors: {} };
  }
}

export async function deleteTrip(tripId: string): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }
  const { user } = session;

  if (!ObjectId.isValid(tripId)) {
    return { success: false, message: 'Invalid trip ID format.' };
  }
  const tripObjectId = new ObjectId(tripId);

  try {
    const tripsCollection = await getTripsCollection();
    const contributionsCollection = await getContributionsCollection();

    const tripToDelete = await tripsCollection.findOne({ _id: tripObjectId });
    if (!tripToDelete) {
      return { success: false, message: 'Trip not found.' };
    }
    if (tripToDelete.userId !== user.sub) {
      return { success: false, message: 'Forbidden. You do not own this trip.' };
    }

    await contributionsCollection.deleteMany({ tripId: tripObjectId });
    const result = await tripsCollection.deleteOne({ _id: tripObjectId, userId: user.sub });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Trip not found or already deleted during operation.' };
    }

    revalidatePath('/');
    revalidatePath('/trips');
    revalidatePath('/manage-trips');
    return { success: true, message: `Trip '${tripToDelete.name}' and all its contributions deleted successfully!` };
  } catch (error) {
    console.error('Error deleting trip:', error);
    return { success: false, message: `Failed to delete trip: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function resetTrip(tripId: string): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }
  const { user } = session;

  if (!ObjectId.isValid(tripId)) {
    return { success: false, message: 'Invalid trip ID format.' };
  }
  const tripObjectId = new ObjectId(tripId);

  try {
    const contributionsCollection = await getContributionsCollection();
    const tripsCollection = await getTripsCollection();

    const tripToReset = await tripsCollection.findOne({ _id: tripObjectId });
    if (!tripToReset) {
      return { success: false, message: 'Trip not found.' };
    }
     if (tripToReset.userId !== user.sub) {
      return { success: false, message: 'Forbidden. You do not own this trip.' };
    }

    await contributionsCollection.deleteMany({ tripId: tripObjectId });

    revalidatePath('/');
    revalidatePath('/trips');
    revalidatePath(`/trips?tripId=${tripId}`); 
    revalidatePath('/manage-trips');
    
    return { success: true, message: `Trip '${tripToReset.name}' has been reset. All contributions deleted.` };
  } catch (error) {
    console.error('Error resetting trip:', error);
    return { success: false, message: `Failed to reset trip: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getAllTripsForCurrentUser(): Promise<Trip[]> {
  const session = await getSession();
  const tripsCollection = await getTripsCollection();
  try {
    if (!session || !session.user) {
      // Not logged in, return all trips (for public viewing on dashboard/trips page)
      return await tripsCollection.find({}).sort({ createdAt: -1 }).toArray();
    }
    // Logged in, return user's trips (for manage-trips page)
    return await tripsCollection.find({ userId: session.user.sub }).sort({ createdAt: -1 }).toArray();
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return [];
  }
}

export async function getRecentPublicTrips(limit: number = 20): Promise<Trip[]> {
  try {
    const tripsCollection = await getTripsCollection();
    return await tripsCollection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  } catch (error) {
    console.error("Failed to fetch recent public trips:", error);
    return [];
  }
}


export async function getTripById(tripId: string): Promise<Trip | null> {
  if (!ObjectId.isValid(tripId)) {
    return null;
  }
  try {
    const tripsCollection = await getTripsCollection();
    const trip = await tripsCollection.findOne({ _id: new ObjectId(tripId) });
    return trip;
  } catch (error) {
    console.error(`Failed to fetch trip ${tripId}:`, error);
    return null;
  }
}

// === Contribution Actions ===

const ContributionFormSchemaServer = z.object({
  username: z.string().min(1, "Username is required.").max(50, { message: "Username must be less than 50 characters." }),
  amount: z.coerce.number().positive("Amount must be positive.").max(100000, { message: "Amount seems too high." }),
  tripId: z.string().refine(val => ObjectId.isValid(val), { message: "Invalid Trip ID" }),
});

export async function submitContribution(prevState: any, formData: FormData) {
  const validatedFields = ContributionFormSchemaServer.safeParse({
    username: formData.get('username'),
    amount: formData.get('amount'),
    tripId: formData.get('tripId'),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, amount, tripId } = validatedFields.data;
  const screenshotFile = formData.get('screenshot') as File;

  if (!screenshotFile || screenshotFile.size === 0) {
    return { message: "Screenshot is required.", errors: { screenshot: ["Screenshot is required."] } };
  }
  if (screenshotFile.size > 5 * 1024 * 1024) { // 5MB
    return { message: "Screenshot must be less than 5MB.", errors: { screenshot: ["Screenshot must be less than 5MB."] } };
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(screenshotFile.type)) {
     return { message: "Only JPG, PNG, WEBP images are allowed.", errors: { screenshot: ["Only JPG, PNG, WEBP images are allowed."] } };
  }

  try {
    const fileBuffer = Buffer.from(await screenshotFile.arrayBuffer());
    const fileName = `contribution_${tripId}_${Date.now()}-${screenshotFile.name.replace(/\s+/g, '_')}`;
    const uploadResult = await uploadImage(fileBuffer, fileName);

    if (!uploadResult || !uploadResult.secure_url) {
      return { message: 'Failed to upload image to Cloudinary.', errors: {} };
    }

    const contributionsCollection = await getContributionsCollection();
    const newContribution: Omit<Contribution, '_id'> = {
      tripId: new ObjectId(tripId),
      username,
      amount,
      screenshotUrl: uploadResult.secure_url,
      status: 'pending',
      createdAt: new Date(),
    };
    await contributionsCollection.insertOne(newContribution as Contribution);

    revalidatePath(`/trips?tripId=${tripId}`);
    revalidatePath('/'); 
    revalidatePath('/manage-trips');
    return { message: 'Contribution submitted successfully!', errors: {} };
  } catch (error) {
    console.error('Error submitting contribution:', error);
    return { message: `Failed to submit contribution: ${error instanceof Error ? error.message : 'Unknown error'}`, errors: {} };
  }
}

export async function approveContribution(contributionId: string): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }
  const { user } = session;

  if (!ObjectId.isValid(contributionId)) {
    return { success: false, message: 'Invalid contribution ID format.' };
  }
  const contributionObjectId = new ObjectId(contributionId);

  try {
    const contributionsCollection = await getContributionsCollection();
    const contributionToUpdate = await contributionsCollection.findOne({ _id: contributionObjectId });

    if (!contributionToUpdate) {
        return { success: false, message: 'Contribution not found.' };
    }

    const trip = await getTripById(contributionToUpdate.tripId.toString());
    if (!trip || trip.userId !== user.sub) {
      return { success: false, message: 'Forbidden. You do not own the trip this contribution belongs to.' };
    }

    const result = await contributionsCollection.updateOne(
      { _id: contributionObjectId, status: 'pending' },
      { $set: { status: 'approved', approvedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      const alreadyApproved = await contributionsCollection.findOne({ _id: contributionObjectId, status: 'approved' });
      if (alreadyApproved) {
        return { success: true, message: 'Contribution already approved.' }; 
      }
      return { success: false, message: 'Contribution not found or not in pending state.' };
    }

    revalidatePath(`/trips?tripId=${contributionToUpdate.tripId.toString()}`);
    revalidatePath('/');
    revalidatePath('/manage-trips');
    return { success: true, message: 'Contribution approved successfully!' };
  } catch (error) {
    console.error('Error approving contribution:', error);
    return { success: false, message: `Failed to approve contribution: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function deleteContribution(contributionId: string): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }
  const { user } = session;

  if (!ObjectId.isValid(contributionId)) {
    return { success: false, message: 'Invalid contribution ID format.' };
  }
  const contributionObjectId = new ObjectId(contributionId);

  try {
    const contributionsCollection = await getContributionsCollection();
    const contributionToDelete = await contributionsCollection.findOne({ _id: contributionObjectId });
    
    if (!contributionToDelete) {
      return { success: false, message: 'Contribution not found.' };
    }

    const trip = await getTripById(contributionToDelete.tripId.toString());
    if (!trip || trip.userId !== user.sub) {
      return { success: false, message: 'Forbidden. You do not own the trip this contribution belongs to.' };
    }

    const result = await contributionsCollection.deleteOne({ _id: contributionObjectId });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Contribution not found or already deleted.' };
    }

    if (contributionToDelete.tripId) {
      revalidatePath(`/trips?tripId=${contributionToDelete.tripId.toString()}`);
    }
    revalidatePath('/'); 
    revalidatePath('/manage-trips');
    return { success: true, message: 'Contribution deleted successfully!' };
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return { success: false, message: `Failed to delete contribution: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getAllContributions(tripId?: string): Promise<Contribution[]> {
  if (!tripId || !ObjectId.isValid(tripId)) {
    return [];
  }
  try {
    const contributionsCollection = await getContributionsCollection();
    return await contributionsCollection.find({ tripId: new ObjectId(tripId) })
      .sort({ status: 1, createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error("Failed to fetch contributions:", error);
    return [];
  }
}

export async function getStats(tripId?: string): Promise<ContributionStats> {
  const defaultStats: ContributionStats = { totalAmount: 0, contributionsByUser: [] };
  
  let currentTrip: Trip | null = null;
  let parsedTripId: ObjectId | undefined = undefined;

  if (tripId && ObjectId.isValid(tripId)) {
    parsedTripId = new ObjectId(tripId);
    currentTrip = await getTripById(tripId);
  } else {
     return { ...defaultStats };
  }
  
  if (!currentTrip) { 
    return { ...defaultStats };
  }

  try {
    const contributionsCollection = await getContributionsCollection();
    const approvedContributions = await contributionsCollection.find({ tripId: parsedTripId, status: 'approved' }).toArray();
    
    const totalAmount = approvedContributions.reduce((sum, contrib) => sum + contrib.amount, 0);

    const contributionsByUserMap = new Map<string, number>();
    approvedContributions.forEach(contrib => {
      contributionsByUserMap.set(
        contrib.username,
        (contributionsByUserMap.get(contrib.username) || 0) + contrib.amount
      );
    });

    const contributionsByUser = Array.from(contributionsByUserMap.entries())
      .map(([username, total]) => ({ username, total }))
      .sort((a, b) => {
        if (b.total === a.total) {
          return a.username.localeCompare(b.username); 
        }
        return b.total - a.total; 
      });

    return { 
        tripId: parsedTripId, 
        tripName: currentTrip.name,
        totalAmount, 
        contributionsByUser 
    };
  } catch (error) {
    console.error("Failed to fetch stats for trip " + tripId + ":", error);
    return { ...defaultStats, tripId: parsedTripId, tripName: currentTrip.name };
  }
}

    