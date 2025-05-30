// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseGlobal | undefined;
}

let cached = global.mongoose as MongooseGlobal | undefined;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!cached) {
    throw new Error("Mongoose cache is not initialized");
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME || "team2",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
