import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    issueId: { 
        type: Number, 
        required: true, 
        index: true 
    },
    issueTitle: String,
    action: {
        type: String,
        enum: ['CREATED', 'ASSIGNED', 'STATUS_CHANGED', 'CLOSED'],
        required: true
    },
    oldStatus: String,
    newStatus: String,
    assignedTo: Number,
    assignedToName: String,
    changedBy: {
        type: String,
        required: true
    },
    changedByRole: String,
    comment: String,
    changedAt: { 
        type: Date, 
        default: Date.now,
        index: true 
    }
}, {
    timestamps: true
});

// Indexes for analytics
historySchema.index({ issueId: 1, changedAt: -1 });
historySchema.index({ action: 1, changedAt: -1 });
historySchema.index({ changedBy: 1, changedAt: -1 });

export default mongoose.model("History", historySchema);