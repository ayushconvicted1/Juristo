import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "../../../lib/connectDB/db";
import User from "../../../lib/db/models/User";

// GET: List all API keys for a user (expects userId as query param)
export async function GET(req) {
  console.log("GET /api/api-keys: Received request", req.url);
  try {
    await dbConnect();
    console.log("GET: Connected to DB successfully");
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    console.log("GET: Extracted userId:", queryUserId);
    if (!queryUserId) {
      console.error("GET: Missing userId");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const user = await User.findOne({
      $or: [{ userId: queryUserId }, { _id: queryUserId }],
    });
    if (!user) {
      console.error("GET: User not found for userId:", queryUserId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("GET: Found user and returning API keys:", user.apiKeys);
    return NextResponse.json({ apiKeys: user.apiKeys });
  } catch (error) {
    console.error("GET: Error fetching API keys:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Generate (or regenerate) an API key.
// Expects a JSON body with { userId, action } where action can be "generate" or "regenerate"
export async function POST(req) {
  console.log(
    "POST /api/api-keys: Received request to generate/regenerate API key"
  );
  try {
    await dbConnect();
    console.log("POST: Connected to DB successfully");
    const { userId: queryUserId, action } = await req.json();
    console.log("POST: Received payload:", { queryUserId, action });
    if (!queryUserId) {
      console.error("POST: Missing userId");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const user = await User.findOne({
      $or: [{ userId: queryUserId }, { _id: queryUserId }],
    });
    if (!user) {
      console.error("POST: User not found for userId:", queryUserId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("POST: Found user:", user.email);

    // If action is "generate", check basic plan API key limit.
    if (action === "generate" && user.plan === "basic") {
      const activeCount = user.apiKeys.filter((k) => k.active).length;
      if (activeCount >= 3) {
        console.error("POST: Maximum API keys reached for basic plan.");
        return NextResponse.json(
          {
            error:
              "Maximum API keys reached for basic plan. Upgrade your plan for more.",
          },
          { status: 400 }
        );
      }
    }

    // Generate a secure random API key.
    const newKey = crypto.randomBytes(32).toString("hex");
    console.log("POST: Generated new API key:", newKey);

    // Set expiration: if the user's plan is "basic", expire in 3 days; otherwise, no expiry.
    let expires = null;
    if (user.plan === "basic") {
      expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      console.log("POST: User is on basic plan. Setting expiry to:", expires);
    } else {
      console.log("POST: User is not on basic plan. No expiry set.");
    }

    // If regenerating, deactivate any active keys.
    if (action === "regenerate") {
      console.log(
        "POST: Regenerate action requested. Deactivating existing API keys."
      );
      user.apiKeys = user.apiKeys.map((k) => ({
        ...k.toObject(),
        active: false,
      }));
    }

    console.log("POST: Appending new API key to user record.");
    user.apiKeys.push({
      key: newKey,
      expires,
      active: true,
    });

    await user.save();
    console.log("POST: User saved successfully with new API key.");
    return NextResponse.json({ apiKey: newKey, expires });
  } catch (error) {
    console.error("POST: Error generating API key:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Deactivate a specific API key.
// Expects query parameters: userId & key
export async function DELETE(req) {
  console.log(
    "DELETE /api/api-keys: Received request to deactivate an API key"
  );
  try {
    await dbConnect();
    console.log("DELETE: Connected to DB successfully");
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const keyToDeactivate = searchParams.get("key");
    console.log(
      "DELETE: Extracted userId:",
      queryUserId,
      "and key:",
      keyToDeactivate
    );
    if (!queryUserId || !keyToDeactivate) {
      console.error("DELETE: Missing parameters");
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const user = await User.findOne({
      $or: [{ userId: queryUserId }, { _id: queryUserId }],
    });
    if (!user) {
      console.error("DELETE: User not found for userId:", queryUserId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const index = user.apiKeys.findIndex((k) => k.key === keyToDeactivate);
    if (index === -1) {
      console.error("DELETE: API key not found:", keyToDeactivate);
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }
    console.log("DELETE: Deactivating API key at index", index);
    user.apiKeys[index].active = false;
    await user.save();
    console.log("DELETE: API key deactivated successfully");
    return NextResponse.json({ message: "API key deactivated" });
  } catch (error) {
    console.error("DELETE: Error deactivating API key:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
