import mongoose from 'mongoose';

const newsletterCampaignSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  recipientsCount: {
    type: Number,
    default: 0,
  },
  triggerType: {
    type: String,
    enum: ['manual', 'new_arrival'],
    default: 'manual',
  },
  productRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
});

const NewsletterCampaign = mongoose.model('NewsletterCampaign', newsletterCampaignSchema);
export default NewsletterCampaign;
