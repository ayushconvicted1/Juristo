"use client";
import { MyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";

const ChatBox = () => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const {
    user,
    selectedChat,
    selectedLanguage,
    selectedCountry,
    fetchChats,
    setUser,
    setSelectedChat,
  } = useContext(MyContext);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
      setChatId(selectedChat.chatId);
    } else {
      setMessages([]);
      setChatId(null);
    }
  }, [selectedChat]);

  const handleSend = async () => {
    setLoading(true);
    if (!input.trim()) return;

    const cid = selectedChat?.chatId;

    const newMessage = {
      userId: user.userId,
      message: input,
      newChat: !selectedChat,
      chatId: cid || undefined,
      country: selectedCountry.label || user.country.label,
      language: selectedLanguage.label || user.language.label,
    };

    try {
      // Send the message to the server
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setInput("");
      // const response = await fetch("http://localhost:5000/api/chat", {
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );
      const responseData = await response.json();

      // Append ChatGPT's response from the API to the messages array
      if (responseData && responseData.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseData.response },
        ]);
      } else {
        console.log("No response from API", responseData);
      }
      if (responseData && responseData.chat) {
        setSelectedChat(responseData.chat);
      } else {
        console.log("No response from API", responseData);
      }
      setLoading(false);
      fetchChats(user);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Trigger when messages change

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-2/3 bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {selectedChat ? selectedChat.title : "New Chat"}
        </h2>
        <button
          onClick={async () => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
            }
            setUser(null);
            setMessages([]);
            setSelectedChat(null);
            router.push("/login");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
      <div className="flex-1 min-h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] overflow-y-auto bg-white p-4 rounded mb-4 shadow">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.role === "user"
                ? "text-right"
                : msg.role === "assistant"
                ? "text-left"
                : "hidden"
            }`}
          >
            <p className="inline-block px-3 py-2 bg-gray-100 rounded">
              {msg.content}
            </p>
          </div>
        ))}
        {loading && (
          <div className=" mb-2 text-left">
            <p className="inline-block px-3 py-2 bg-gray-100 rounded">
              typing...
            </p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className=" px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
