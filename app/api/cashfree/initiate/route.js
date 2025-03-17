import { NextResponse } from "next/server";
import axios from "axios";
import connectDB from "../../../../lib/connectDB/db";
import User from "../../../../lib/db/models/User";
import Coupon from "../../../../lib/db/models/Coupon.js"; // Import your Coupon model

export async function POST(req) {
  try {
    console.log("Initiate Payment: Request received");
    await connectDB();
    console.log("Initiate Payment: Connected to DB");

    // Retrieve plan, userId, and coupon from the request body
    const { plan, userId, coupon } = await req.json();
    console.log(
      "Initiate Payment: Received plan =",
      plan,
      "userId =",
      userId,
      "coupon =",
      coupon
    );

    if (!userId) {
      console.log("Initiate Payment: No userId provided");
      return NextResponse.json(
        { error: "User ID not provided" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("Initiate Payment: User not found with ID", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("Initiate Payment: Found user", user.email);

    // Define plan details
    const plans = {
      basic: { amount: 0, description: "Basic Plan (Free)" },
      super: { amount: 199, description: "Super Plan" },
      advance: { amount: 399, description: "Advance Plan" },
    };

    if (!plans[plan]) {
      console.log("Initiate Payment: Invalid plan selected:", plan);
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    let { amount, description } = plans[plan];
    console.log("Initiate Payment: Plan", plan, "with amount", amount);

    // If a coupon is provided, validate it from the DB.
    if (coupon) {
      // Convert coupon to uppercase for matching, assuming coupon titles are stored in uppercase.
      const couponCode = coupon.toUpperCase();
      const couponDoc = await Coupon.findOne({ couponTitle: couponCode });
      if (!couponDoc || couponDoc.status !== "Active") {
        console.log(
          "Initiate Payment: Invalid or inactive coupon code provided:",
          coupon
        );
        return NextResponse.json(
          { error: "Invalid coupon code" },
          { status: 400 }
        );
      }

      // Check if the order meets the minimum price required for this coupon
      if (amount < couponDoc.minPrice) {
        console.log(
          "Initiate Payment: Coupon not applicable, order amount is less than minimum required:",
          amount,
          couponDoc.minPrice
        );
        return NextResponse.json(
          {
            error: `Coupon not applicable for orders below ₹${couponDoc.minPrice}`,
          },
          { status: 400 }
        );
      }

      // Apply discount from the coupon document
      const discountPercentage = couponDoc.discount; // e.g., 45 for a 45% discount
      const discountAmount = amount * (discountPercentage / 100);
      const newAmount = parseFloat((amount - discountAmount).toFixed(2));
      console.log(
        `Initiate Payment: Coupon ${couponCode} applied, ${discountPercentage}% discount. Original amount: ${amount}, new amount: ${newAmount}`
      );
      amount = newAmount;
      description =
        description + ` (${discountPercentage}% off coupon applied)`;

      // Optionally, update coupon usage (consider updating after payment confirmation)
      // await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { timesUsed: 1 } });
    }

    // If free plan is selected, update the user immediately.
    if (amount === 0) {
      user.plan = "basic";
      await user.save();
      console.log("Initiate Payment: Free plan selected; user updated");
      return NextResponse.json({
        message: "Basic plan is free. Your plan has been updated.",
      });
    }

    // Place return_url inside order_meta
    const return_url =
      process.env.RETURN_URL || "https://juristo-nine.vercel.app/dashboard";
    console.log(
      "Initiate Payment: Sending request to Cashfree with return_url:",
      return_url
    );

    const payload = {
      order_id: `order_${Date.now()}`,
      order_amount: amount,
      order_currency: "INR",
      order_note: description,
      order_meta: {
        return_url, // Cashfree will redirect here after payment
      },
      customer_details: {
        customer_id: user._id.toString(),
        customer_email: user.email,
        customer_phone: user.phone || "9876543210",
      },
    };

    const cashfreeResponse = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/orders`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-01-01",
        },
      }
    );

    console.log("Initiate Payment: Cashfree response:", cashfreeResponse.data);
    return NextResponse.json(cashfreeResponse.data);
  } catch (error) {
    console.log("Initiate Payment Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
