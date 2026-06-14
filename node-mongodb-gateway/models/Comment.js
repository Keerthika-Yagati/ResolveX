import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    issueId: { 
        type: Number, 
        required: true, 
        index: true 
    },
    userId: { 
        type: Number, 
        required: true  // This is causing the error if userId is missing
    },
    userEmail: { 
        type: String, 
        required: true 
    },
    userFullname: { 
        type: String, 
        default: "User"  // Changed from required to default
    },
    comment: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true 
    }
}, {
    timestamps: true
});

// Compound index for faster queries
commentSchema.index({ issueId: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);