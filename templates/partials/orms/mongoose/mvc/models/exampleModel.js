import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Example = mongoose.model('Example', exampleSchema);
