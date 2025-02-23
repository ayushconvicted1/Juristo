// app/api/draftchats/user/[userId]/route.js
import { NextResponse } from "next/server";
import { draftChats } from "../../draftchatstore";

export async function GET(request, context) {
  // Await the params property before using it
  const params = await Promise.resolve(context.params);
  const userId = params.userId;
  console.log("Fetching draft chats for userId:", userId);

  const userChats = draftChats.filter((chat) => chat.userId === userId);
  console.log("Draft chats found:", userChats);

  return NextResponse.json(userChats);
}
