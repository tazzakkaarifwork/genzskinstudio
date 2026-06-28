import mongoose from 'mongoose';

const retentionReminderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  daysInactive: {
    type: Number,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'sent',
  },
});

const RetentionReminder = mongoose.model('RetentionReminder', retentionReminderSchema);
export default RetentionReminder;
