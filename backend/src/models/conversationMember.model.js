import mongoose from 'mongoose';

const conversationMemberSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member"
        },

        lastReadMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },

        unreadCount: { type: Number, default: 0 },

        muted: { type: Boolean, default: false },

        joinedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

conversationMemberSchema.index(
    { conversationId: 1, userId: 1 },
    { unique: true }
);

export default mongoose.model(
    "ConversationMember",
    conversationMemberSchema
);
