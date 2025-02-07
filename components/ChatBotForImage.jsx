"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { format, isValid } from "date-fns";
import {
  ArrowUpRight,
  Copy,
  Mic,
  Moon,
  RefreshCw,
  Volume2,
  Upload,
  File,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { HashLoader } from "react-spinners";
import cn from "classnames";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const formatMessageTime = (timestamp) => {
  if (timestamp && !isNaN(new Date(timestamp).getTime())) {
    return format(new Date(timestamp), "dd MMM • h:mm a");
  }
  return "";
};

const ChatBoxForDocs = () => {
  const router = useRouter();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [imgSelected, setImgSelected] = useState(false);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const { user, selectedChat, fetchDocChats, setSelectedChat } =
    useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("documentation");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const newMessage = {
      userId: user.userId,
      question: input,
      chatId: chatId || undefined,
    };
    try {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input, timestamp: new Date() },
      ]);
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
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              responseData.chat.messages[responseData.chat.messages.length - 1]
                .content,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          {
            role: "assistant",
            content: `AI Response: ${result.message}`,
            timestamp: new Date(),
          },
        ]);
        setChatId(result.chatId);
        setSelectedChat(result.chat);
        setImgSelected(true);
        setUploadedFile(file);
        fetchDocChats(user);
        toast.success("File uploaded and analyzed successfully");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      toast.error("Failed to upload and analyze file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";
      handleFileUpload(file, fileType);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setImgSelected(false);
    setMessages([]);
    setChatId(null);
    setSelectedChat(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const handleGenerateResponse = async (content) => {
    toast.success("Regenerating response...");
    // Implement regenerate logic here
  };

  const handleAudioToggle = () => {
    toast.success("Audio feature coming soon!");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="p-4 bg-white shadow-md">
        <h1 className="text-xl font-bold text-center">Document Chat</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {!imgSelected ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Upload className="w-16 h-16 text-gray-400" />
            <p className="text-lg text-gray-600">Upload PDF or Image</p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, JPEG, PNG
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Upload File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {uploadedFile && (
              <Card className="p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
                <div className="flex items-center space-x-4">
                  {uploadedFile.type.startsWith("image/") ? (
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  ) : (
                    <File className="w-8 h-8 text-gray-500" />
                  )}
                  <p className="text-sm text-gray-700">{uploadedFile.name}</p>
                  <Button
                    onClick={removeFile}
                    variant="ghost"
                    size="sm"
                    className="ml-auto p-2 text-red-500 hover:bg-red-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            <ScrollArea className="h-[calc(100vh-200px)]">
              {messages.map((msg, index) => (
                <div key={index} className="mb-4">
                  {index === 0 && (
                    <p className="text-xs text-gray-500 text-center mb-2">
                      Today
                    </p>
                  )}
                  <div
                    className={cn(
                      "flex items-start space-x-2 p-3 rounded-lg",
                      msg.role === "user"
                        ? "bg-blue-100 self-end"
                        : "bg-gray-100 self-start"
                    )}
                  >
                    <Avatar>
                      <AvatarImage
                        src={msg.role === "user" ? "/user.png" : "/bot.png"}
                      />
                      <AvatarFallback>
                        {msg.role === "user" ? "U" : "B"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {msg.role === "user" ? "You" : "Juristo"}
                      </p>
                      <ReactMarkdown
                        className="text-sm text-gray-700 whitespace-pre-wrap"
                        remarkPlugins={[remarkGfm]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatMessageTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex space-x-2 mt-2">
                      <Button
                        onClick={() => handleGenerateResponse(msg.content)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Regenerate
                      </Button>
                      <Button
                        onClick={() => handleCopy(msg.content)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-center py-4">
                  <HashLoader color="#36D7B7" size={30} />
                </div>
              )}
              <div ref={chatEndRef} />
            </ScrollArea>
          </div>
        )}
      </main>

      {/* Input Area */}
      {imgSelected && (
        <footer className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask questions about your document..."
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Send
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ChatBoxForDocs;
