import mongoose from "mongoose";

const delayedTimeSchema = new mongoose.Schema({
  hours: { type: String, required: true },
  minutes: { type: String, required: true },
});

const statusTimeSchema = new mongoose.Schema({
  hours: { type: String, required: true },
  minutes: { type: String, required: true },
});

const trainSchema = new mongoose.Schema({
  trainNo: { type: String, required: true },
  delayedTime: { type: delayedTimeSchema, required: true },
  direction: { type: String, required: true },
  name: { type: String, required: true },
  station: { type: String, required: true },
  status: { type: String, required: true },
  statusTime: { type: statusTimeSchema, required: true },
  type: { type: String, required: true },
});

const trainsSchema = new mongoose.Schema(
  {
    count: { type: Number, required: true },
    lastUpdateAtUpstream: { type: Date, required: true },
    trains: [trainSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Trains = mongoose.models.Trains || mongoose.model("Trains", trainsSchema);

export default Trains;
