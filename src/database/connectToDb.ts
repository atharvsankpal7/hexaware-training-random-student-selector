import mongoose, { Mongoose } from "mongoose";

// The MongoDB connection string from environment variables
const MONGODB_URL = process.env.MONGODB_URL!;

// Interface defining the structure of the connection cache
interface MongooseConnection {
    // The connection to the database
    conn: Mongoose | null;
    // The promise used to connect to the database
    promise: Promise<Mongoose> | null;
}

// Getting the connection from the global variable, with a type assertion
// This avoids implicit any error for the global variable.
const cached: MongooseConnection = (global as typeof globalThis & { mongoose?: MongooseConnection }).mongoose || { conn: null, promise: null };

// If there is no connection cached globally, create a new one
if (!cached) {
    (global as typeof globalThis & { mongoose?: MongooseConnection }).mongoose = cached;
}

/**
 * Connects to the MongoDB database defined in the MONGODB_URL environment variable.
 * Caches the database connection to avoid creating new connections each time.
 * If a cached connection exists, returns it; otherwise, creates a new one.
 * @returns The MongoDB connection instance
 */
export const connectToMongoDB = async () => {
    // If a connection is already cached, return it
    if (cached.conn) {
        return cached.conn;
    }

    // If MONGODB_URL is not defined, throw an error
    if (!MONGODB_URL) {
        throw new Error("Please define MONGODB_URL");
    }

    // If connection promise is not present, call the database to create one
    cached.promise =
        cached.promise ||
        mongoose.connect(MONGODB_URL, {
            dbName: "hexaware-training",
            bufferCommands: false,
        });

    // Once the promise resolves and the connection is created, cache it and return it
    cached.conn = await cached.promise;
    return cached.conn;
};
