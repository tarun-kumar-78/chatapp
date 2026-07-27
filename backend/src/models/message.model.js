import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text"
        },

        content: { type: String },

        metadata: {
            fileUrl: String,
            fileName: String,
            fileSize: Number,
            replyTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message"
            }
        },
        isRead: {
            type: Boolean,
            default: false,
        },

        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        embeddings: {
            type: [Number],
            required: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Indexes for fast chat loading
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({
    conversationId: 1,
    senderId: 1,
    isRead: 1,
});
messageSchema.index({ senderId: 1 });

export default mongoose.model("Message", messageSchema);
