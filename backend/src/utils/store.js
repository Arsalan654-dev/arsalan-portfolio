const mongoose = require('mongoose');

// Persistent key/value store used for OTPs, email-verification tokens,
// password-reset tokens and refresh tokens. Backed by MongoDB so values
// survive across serverless invocations on Vercel.
const COLLECTION = 'app_store';

const getCollection = () => mongoose.connection.collection(COLLECTION);

let indexPromise = null;
const ensureIndex = () => {
  if (!indexPromise) {
    indexPromise = getCollection()
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      .catch(() => {});
  }
  return indexPromise;
};

const storeSet = async (key, ttl, value) => {
  await ensureIndex();
  await getCollection().updateOne(
    { _id: key },
    { $set: { value, expiresAt: new Date(Date.now() + ttl * 1000) } },
    { upsert: true }
  );
};

const storeGet = async (key) => {
  const entry = await getCollection().findOne({ _id: key });
  if (!entry) return null;

  if (entry.expiresAt && entry.expiresAt.getTime() < Date.now()) {
    await getCollection().deleteOne({ _id: key });
    return null;
  }

  return entry.value;
};

const storeDel = async (key) => {
  await getCollection().deleteOne({ _id: key });
};

module.exports = { storeSet, storeGet, storeDel };
