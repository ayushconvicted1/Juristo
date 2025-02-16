import { NextResponse } from "next/server";
import connectDB from "../../../../lib/connectDB/db";
import User from "../../../../lib/db/models/User";

export async function POST(req) {
  try {
    console.log("Webhook: Request received");
    await connectDB();
    const data = await req.json();
    console.log("Webhook: Received data", data);

    if (data.txStatus === "SUCCESS") {
      console.log("Webhook: Payment successful");
      const userId = data.customer_details?.customer_id;
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          // Update user plan based on order_note
          if (data.order_note && data.order_note.includes("Super")) {
            user.plan = "super";
          } else if (data.order_note && data.order_note.includes("Advance")) {
            user.plan = "advance";
          }
          await user.save();
          console.log("Webhook: Updated user plan to", user.plan);
        } else {
          console.log("Webhook: User not found with id", userId);
        }
      } else {
        console.log("Webhook: No user id in customer_details");
      }
    } else {
      console.log("Webhook: Payment not successful, status:", data.txStatus);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
