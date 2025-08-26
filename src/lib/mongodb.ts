import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn("[DB] MONGODB_URI is not set. Database features will be disabled until configured.");
}

interface GlobalWithMongoose {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

declare const global: typeof globalThis & GlobalWithMongoose;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (!MONGODB_URI) return null;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Reduce buffering/timeout behavior to fail fast in serverless
    mongoose.set("bufferCommands", false);
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 8000, // fail fast if cluster is unreachable
      socketTimeoutMS: 20000,
      connectTimeoutMS: 8000,
      maxPoolSize: 5,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
