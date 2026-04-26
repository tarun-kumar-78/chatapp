import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["private", "group"],
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }],
        conversationKey: {
            type: String,
            required: true,
            unique: true,
        },

        title: { type: String },
        avatar: { type: String },

        lastMessage: {
            messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: { type: String },
            type: { type: String },
            createdAt: { type: Date }
        }
    },
    { timestamps: true }
);
conversationSchema.index({ conversationKey: 1 }, { unique: true });
export const Conversation = mongoose.model("Conversation", conversationSchema);