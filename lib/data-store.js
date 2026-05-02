import "server-only"

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DB ?? "expense-manager"
const gloabalForMongo = globalThis

const indexes = [
  ["users", { email: 1 }, { unique: true }],
  ["users", { id: 1 }, { unique: true }],
  ["expenses", { id: 1 }, { unique: true }],
  ["expenses", { userId: 1, date: -1, createdAt: -1 }],
  ["expenses", { userId: 1, category: 1 }]
]

let clientPromise
let indexesPromis

function connectToMongo() {
  if (process.env.NODE_ENV === "development") {
    mongoCache.expenseManagerMongoClientPromise ??= new MongoClient(uri).connect();

    return mongoCache.expenseManagerMongoClientPromise;
  }

  clientPromise ??= new MongoClient(uri).connect();
  return clientPromise;
}

async function getDatabase() {
  const client = await connectToMongo()
  return client.db(databaseName)
}

async function ensureIndexes(database) {
  indexesPromis ??= Promise.all(
    indexes.map(([collectionName, keys, options]) => database.collection(collectionName).createIndex(keys, options))
  )

  await indexesPromis
}

async function getCollection(name) {
  const database = await getDatabase()
  await ensureIndexes(database)

  return database.collection(name)
}

export async function getExpensesCollection() {
  return getCollection("expenses")
}

export async function getUsersCollection() {
  return getCollection("users")
}