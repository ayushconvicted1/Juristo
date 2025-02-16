import { NextResponse } from "next/server";
import axios from "axios";
import connectDB from "../../../../lib/connectDB/db";
import User from "../../../../lib/db/models/User";

export async function POST(req) {
  try {
    console.log("Initiate Payment: Request received");
    await connectDB();
    console.log("Initiate Payment: Connected to DB");

    // Retrieve plan and userId from the request body
    const { plan, userId } = await req.json();
    console.log(
      "Initiate Payment: Received plan =",
      plan,
      "and userId =",
      userId
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

    const { amount, description } = plans[plan];
    console.log("Initiate Payment: Plan", plan, "with amount", amount);

    // If free plan is selected, update the user immediately.
    if (amount === 0) {
      user.plan = "basic";
      await user.save();
      console.log("Initiate Payment: Free plan selected; user updated");
      return NextResponse.json({
        message: "Basic plan is free. Your plan has been updated.",
      });
    }

    // Place return_url inside order_meta instead of top-level.
    const return_url =
      process.env.RETURN_URL || "https://juristo-prod.vercel.app/dashboard";
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
        return_url, // This will tell Cashfree where to redirect after payment
        // Optionally, you can add a notify_url if needed
        // notify_url: process.env.NOTIFY_URL || return_url,
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
