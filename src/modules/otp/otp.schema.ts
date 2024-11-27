import * as mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    otp: { type: String, required: true },
    expireAt: { type: Date, expires: 90, default: Date.now, required: true },
    phone_number: { type: String, required: true, unique: true },
});
otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 90 });

export const OtpModel = mongoose.model('otps', otpSchema);
