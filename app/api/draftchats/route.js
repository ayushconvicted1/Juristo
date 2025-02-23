// /src/app/api/draft-chat/route.js
import { NextResponse } from "next/server";
import { draftChats } from "./draftchatstore";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, message, newChat, chatId, country, language } = body;

    if (newChat) {
      // Generate a new chatId (for demo purposes, using timestamp)
      const newChatId = Date.now().toString();
      // Use a portion of the message as the title or fallback to a default title
      const title = message ? message.substring(0, 20) : "Draft Chat";
      const chat = {
        chatId: newChatId,
        userId,
        title,
        description: message.substring(0, 30),
        createdAt: new Date().toISOString(),
        messages: [
          {
            role: "user",
            content: message,
            timestamp: new Date().toISOString(),
          },
        ],
        country,
        language,
      };
      draftChats.push(chat);
      return NextResponse.json({ chat });
    } else {
      // Update an existing chat
      const index = draftChats.findIndex((chat) => chat.chatId === chatId);
      if (index === -1) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
      // Append the new message
      draftChats[index].messages.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ chat: draftChats[index] });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
