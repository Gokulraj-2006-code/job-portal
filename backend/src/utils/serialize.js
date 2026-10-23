// Converts a Mongoose document (or plain object with _id) into a plain
// object with a string `id` field, mirroring the shape the frontend
// already expects from the old mock database (which used string ids
// like "job_1").
const serialize = (doc) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  delete obj.__v;
  return obj;
};

const serializeMany = (docs) => docs.map(serialize);

module.exports = { serialize, serializeMany };
