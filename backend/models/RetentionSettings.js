import mongoose from 'mongoose';

const retentionSettingsSchema = new mongoose.Schema({
  autoReminderEnabled: {
    type: Boolean,
    default: false,
  },

  // BACKWARD + PRODUCTION SUPPORT
  inactivityDays: {
    type: Number,
    default: 30,
  },

  // NEW: flexible value (used for both days/minutes)
  inactivityValue: {
    type: Number,
    default: 30,
  },

  inactivityUnit: {
    type: String,
    enum: ['days', 'minutes'],
    default: 'days',
  },

  // NEW: timer-based testing enable switch
  timerModeEnabled: {
    type: Boolean,
    default: false,
  },

  couponCode: {
    type: String,
    default: 'GLOWBACK10',
  },

  discountPercent: {
    type: Number,
    default: 10,
  },

  emailTemplate: {
    type: String,
    default:
      'Hey {{name}}, we miss you! Use code {{code}} for {{discount}}% off your next purchase!',
  },

  // NEW: Multiple promo codes (admin managed)
  promoCodes: [{
    code: { type: String, required: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    label: { type: String, default: '' },
  }],
});

const RetentionSettings = mongoose.model(
  'RetentionSettings',
  retentionSettingsSchema
);

export default RetentionSettings;