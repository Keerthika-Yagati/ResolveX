import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    issueId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true },
    userEmail: { type: String, required: true },
    userFullname: String,
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    vector: { type: [Number] }  // ← ADD THIS for vector embeddings
}, {
    timestamps: true
});

commentSchema.index({ issueId: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);