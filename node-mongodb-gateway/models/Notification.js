import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { 
        type: Number, 
        required: true, 
        index: true 
    },
    userEmail: String,
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['ISSUE_CREATED', 'ISSUE_ASSIGNED', 'STATUS_CHANGED', 'ISSUE_CLOSED', 'COMMENT_ADDED'],
        required: true
    },
    relatedIssueId: Number,
    relatedIssueTitle: String,
    read: { 
        type: Boolean, 
        default: false,
        index: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true 
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);