"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { FaImage, FaFilePdf } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipLoader } from "react-spinners";
import { Skeleton } from "./ui/skeleton";
import { Mic } from "lucide-react";

const ChatBoxForDocs = () => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [imgSelected, setImgSelected] = useState(false);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const { user, selectedChat, fetchDocChats, setSelectedChat } =
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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );
      const responseData = await response.json();
      if (responseData && responseData.chat) {
        setSelectedChat(responseData.chat);
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

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userInput", input);
    formData.append("userId", user.userId);

    try {
      setLoading(true);
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
    <div className="w-[800px] bg-white shadow rounded-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedChat ? selectedChat.title : "New Chat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] flex flex-col gap-4">
          <div className="flex-1 bg-gray-50 overflow-y-auto p-4 rounded">
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
                <p className="inline-block px-3 py-2 bg-gray-100 rounded-md">
                  {msg.content}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-100">
                  <Skeleton className="w-[100px] h-[20px] rounded-full" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t pt-4 flex gap-2 items-center">
            {imgSelected ? (
              <>
                <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border p-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask questions now"
                    className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button variant="ghost" size="icon">
                    <Mic className="h-5 w-5 text-gray-400" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-center gap-4">
                {loading ? (
                  <ClipLoader size={25} color="#000" loading={loading} />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBoxForDocs;
