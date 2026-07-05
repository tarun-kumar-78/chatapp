import mongoose from 'mongoose'


const resetPasswordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    },
}, { timestamps: true });

resetPasswordSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

export const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);