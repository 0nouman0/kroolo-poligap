import { Redis } from "ioredis";

let redisClient: Redis | null = null;
let isInitialized = false;

const createRedisClient = (): Redis => {
  if (!redisClient) {
    const client = new Redis(
      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      { enableReadyCheck: false, maxRetriesPerRequest: null }
    );

    client.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    client.on("error", (err) => {
      console.error("❌ Redis connection failed:", err.message);
    });

    redisClient = client;
  }

  return redisClient;
};

export async function initializeRedis() {
  if (isInitialized) {
    return;
  }

  try {
    createRedisClient();
    isInitialized = true;
  } catch (error) {
    console.error(
      "❌ Redis initialization failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}

const setKeyValueInHash = async (
  hashKey: string,
  field: string,
  value: string
): Promise<void> => {
  try {
    if (!redisClient) throw new Error("Redis client not initialized");
    await redisClient.hset(hashKey, field, value);
  } catch (err) {
    console.error(
      `Error setting key-value in hash: ${hashKey} - ${field}`,
      err
    );
  }
};

const getValueFromHash = async (
  hashKey: string,
  field: string
): Promise<string | null> => {
  try {
    if (!redisClient) throw new Error("Redis client not initialized");
    const value = await redisClient.hget(hashKey, field);
    return value;
  } catch (err) {
    console.error(
      `Error retrieving value from hash: ${hashKey} - ${field}`,
      err
    );
    return null;
  }
};

const deleteFromHash = async (
  hashKey: string,
  field: string
): Promise<void> => {
  try {
    if (!redisClient) throw new Error("Redis client not initialized");
    await redisClient.hdel(hashKey, field);
  } catch (err) {
    console.error(`Error deleting field from hash: ${hashKey} - ${field}`, err);
  }
};

const getAllHashKeys = async (hashKey: string): Promise<string[]> => {
  try {
    if (!redisClient) throw new Error("Redis client not initialized");
    const keys = await redisClient.hkeys(hashKey);
    return keys;
  } catch (err) {
    console.error(`Error fetching keys from hash: ${hashKey}`, err);
    return [];
  }
};

const shutdownRedisConnection = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
    }
  } catch (error) {
    console.error("Error closing Redis connection:", error);
  }
};

process.on("SIGINT", async () => {
  await shutdownRedisConnection();
  process.exit(0);
});

await initializeRedis();

export {
  redisClient,
  createRedisClient,
  setKeyValueInHash,
  getValueFromHash,
  deleteFromHash,
  getAllHashKeys,
};
