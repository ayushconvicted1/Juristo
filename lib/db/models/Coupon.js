import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    couponTitle: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
