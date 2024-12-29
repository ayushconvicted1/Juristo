"use client";
import { MyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaImage, FaFilePdf } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const ChatBoxForDocs = () => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [imgSelected, setImgSelected] = useState(false);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const { user, selectedChat, fetchDocChats, setUser, setSelectedChat } =
    useContext(MyContext);
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
      setImgSelected(true);
    } else {
      setMessages([]);
      setChatId(null);
      setImgSelected(false);
    }
  }, [selectedChat]);

  const handleSend = async () => {
    setLoading(true);
    if (!input.trim()) return;

    const newMessage = {
      userId: user.userId,
      question: input,
      chatId: chatId || undefined,
    };

    try {
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setInput("");
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/image-chat/chat",
        {
          // const response = await fetch("http://localhost:5000/api/image-chat/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );
      const responseData = await response.json();
      console.log(responseData);

      if (responseData && responseData.chat) {
        setSelectedChat(responseData.chat);
      } else {
        console.log("No response from API", responseData);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userInput", input);
    formData.append("userId", user.userId);

    try {
      setLoading(true);
      // const response = await fetch("http://localhost:5000/api/image-chat/process-file", {
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/image-chat/process-file",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.message === "Analyzed successfully.") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `AI Response: ${result.message}` },
        ]);
        setChatId(result.chatId);
        setSelectedChat(result.chat);
        setImgSelected(true);
        fetchDocChats(user);
      } else {
        console.error("Error in file upload:", result.error);
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, "image");
    }
  };

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, "pdf");
    }
  };

  return (
    <div className="flex flex-col w-full bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {selectedChat ? selectedChat.title : "New Chat"}
        </h2>
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
        {imgSelected ? (
          <>
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
          </>
        ) : (
          <div className="flex justify-center w-full items-center gap-2">
            {loading ? (
              <ClipLoader size="25" color="#000" loading={loading} />
            ) : (
              <>
                <label className="cursor-pointer">
                  <FaImage className="text-xl text-blue-500" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <label className="cursor-pointer">
                  <FaFilePdf className="text-xl text-red-500" />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBoxForDocs;
