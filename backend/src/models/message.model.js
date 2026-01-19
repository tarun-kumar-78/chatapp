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

        type: {
            type: String,
            enum: ["text", "image", "file", "system"],
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

        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Indexes for fast chat loading
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

export default mongoose.model("Message", messageSchema);
