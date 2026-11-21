import { MongoClient, type Db } from "mongodb";

/**
 * Shared MongoDB connection. Keeping the client on `globalThis` prevents dev
 * HMR from opening a new pool on every module reload.
 */
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

function getClient(): MongoClient {
  if (!globalForMongo.mongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    globalForMongo.mongoClient = new MongoClient(uri);
  }
  return globalForMongo.mongoClient;
}

export function getDatabase(): Db {
  return getClient().db("wed-plan");
}
