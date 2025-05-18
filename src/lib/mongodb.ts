
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import type { Contribution, Trip } from '@/types';

const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
  });
  clientPromise = client.connect();
}

async function getDb() {
  if (!clientPromise) {
    throw new Error("MongoDB client not initialized");
  }
  const mongoClient = await clientPromise;
  return mongoClient.db();
}

export async function getContributionsCollection() {
  const db = await getDb();
  return db.collection<Contribution>('contributions');
}

export async function getTripsCollection() {
  const db = await getDb();
  return db.collection<Trip>('trips');
}

export { ObjectId };
