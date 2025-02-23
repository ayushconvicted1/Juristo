// /src/app/api/draft-chat/chat/[chatId]/route.js
import { NextResponse } from "next/server";
import { draftChats } from "../../draftchatstore";

export async function DELETE(request, context) {
  const { params } = await Promise.resolve(context);
  const { chatId } = params;
  const index = draftChats.findIndex((chat) => chat.chatId === chatId);
  if (index === -1) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }
  draftChats.splice(index, 1);
  return NextResponse.json({ message: "Chat deleted successfully" });
}

export async function GET(request, context) {
  // Await the dynamic params before accessing them
  const { params } = await Promise.resolve(context);
  const { chatId } = params;
  console.log("GET draft chat for chatId:", chatId);

  const chat = draftChats.find((chat) => chat.chatId === chatId);
  if (!chat) {
    console.error("Draft chat not found for chatId:", chatId);
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }
  console.log("Returning draft chat:", chat);
  return NextResponse.json(chat);
}
