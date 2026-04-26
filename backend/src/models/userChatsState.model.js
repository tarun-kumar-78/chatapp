import mongoose from 'mongoose';

const userChatStateSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },

    deletedTill: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    lastReadMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    mutedTill: {
        type: Date,
        default: null
    },

    isArchived: {
        type: Boolean,
        default: false
    },

    isPinned: {
        type: Boolean,
        default: false
    },
},
    { timestamps: true });

userChatStateSchema.index(
    { userId: 1, conversationId: 1 },
    { unique: true }
);

export const UserChatState = mongoose.model("UserChatSchema", userChatStateSchema);