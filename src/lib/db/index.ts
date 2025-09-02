import type { Connection } from "mongoose";
import mongoose from "mongoose";
import { DatabaseName, DB_CONFIG, DbConfig } from "./config";

if (!DB_CONFIG.enterprise.uri) {
  throw new Error('Invalid/Missing environment variables: "MONGODB_URI"');
}

let enterpriseConnection: Connection | null = null;

function setupConnectionListeners(connection: Connection, dbName: string) {
  connection.on("connected", () => {
    console.log(`📡 Mongoose connected to MongoDB ${dbName}`);
  });

  connection.on("error", (err) => {
    console.error(`❌ Mongoose connection error for ${dbName}:`, err);
  });

  connection.on("disconnected", () => {
    console.log(`🔌 Mongoose disconnected from MongoDB ${dbName}`);
  });
}

async function connectDB(
  config: DbConfig<DatabaseName>
): Promise<mongoose.Connection> {
  const opts = {
    bufferCommands: true,
  };

  console.log(`🔄 Creating new MongoDB connection for ${config.name}...`);

  try {
    const mongooseInstance = mongoose.createConnection(
      config.uri as string,
      opts
    );
    console.log(`✅ Successfully connected to MongoDB ${config.name}`);
    setupConnectionListeners(mongooseInstance, config.name);
    return mongooseInstance;
  } catch (error) {
    console.error(`❌ MongoDB connection error for ${config.name}:`, error);
    throw error;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (enterpriseConnection) await enterpriseConnection.close();
  console.log("👋 MongoDB connections closed through app termination");
  process.exit(0);
});

export const connectDBEnterprise = async () => {
  if (!enterpriseConnection)
    enterpriseConnection = await connectDB(DB_CONFIG.enterprise);
};

export const initializeConnection = () => Promise.all([connectDBEnterprise()]);

const connections = {
  get enterprise() {
    return enterpriseConnection!;
  },
};

export default connections;
await initializeConnection();
