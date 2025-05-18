
import type { ObjectId } from 'mongodb';

export interface Trip {
  _id: ObjectId;
  userId: string; // Auth0 user ID (sub)
  userEmail?: string; // User's email for display
  name: string;
  description?: string;
  goalAmount?: number;
  upiId?: string;
  qrCodeImageUrl?: string;
  createdAt: Date;
  // createdBy is now implicitly userId/userEmail
}

export interface Contribution {
  _id: ObjectId;
  tripId: ObjectId; // Link to the Trip
  username: string; // Name of the contributor (can be different from trip owner)
  amount: number;
  screenshotUrl: string;
  status: 'pending' | 'approved';
  createdAt: Date;
  approvedAt?: Date;
}

export interface ContributionStats {
  tripId?: ObjectId; 
  tripName?: string; 
  totalAmount: number;
  contributionsByUser: { username: string; total: number }[];
}

// Serializable versions for Client Components
export interface SerializableTrip {
  _id: string;
  userId: string;
  userEmail?: string;
  name: string;
  description?: string;
  goalAmount?: number;
  upiId?: string;
  qrCodeImageUrl?: string;
  createdAt: string; // ISO date string
}

export interface SerializableContribution {
  _id: string;
  tripId: string; 
  username: string;
  amount: number;
  screenshotUrl: string;
  status: 'pending' | 'approved';
  createdAt: string; // ISO date string
  approvedAt?: string; // ISO date string
}

export interface SerializableContributionStats {
  tripId?: string;
  tripName?: string;
  totalAmount: number;
  contributionsByUser: { username: string; total: number }[];
}
