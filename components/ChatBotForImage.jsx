"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Copy,
  Mic,
  RefreshCw,
  Volume2,
  Upload,
  File,
  X,
  ImageIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "react-hot-toast";
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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [copied, setCopied] = useState(false);

  // Reset chat state on mount so that a new conversation starts on tab switch
  useEffect(() => {
    setSelectedChat(null);
    setMessages([]);
    setChatId(null);
    setImgSelected(false);
  }, [setSelectedChat]);

  // Update local states whenever selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      const filteredMessages = selectedChat.messages
        // Filter out internal instructions
        .filter(
          (msg) => !msg.content.startsWith("You are a Legal AI Assistant")
        )
        .map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || Date.now()),
        }));
      setMessages(filteredMessages);
      setChatId(selectedChat.chatId);
      setImgSelected(true);
    } else {
      setMessages([]);
      setChatId(null);
      setImgSelected(false);
    }
  }, [selectedChat]);

  // Check if token exists on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [user, router]);

  // Smooth scroll to the bottom when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const newMessage = {
      userId: user._id,
      question: input,
      chatId: chatId || undefined,
    };

    try {
      // Append the user's message locally
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
      if (responseData && responseData.response) {
        // Updated regex to remove any internal assistant instruction text
        const aiResponse = responseData.response
          .replace(/^You are a Legal AI Assistant.*?\n/, "")
          .trim();

        // Update the last user message to the assistant's response
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? {
                  role: "assistant",
                  content: aiResponse,
                  timestamp: new Date(),
                }
              : msg
          )
        );
      }
      if (responseData && responseData.chat) {
        setSelectedChat(responseData.chat);
        const lastMsg =
          responseData.chat.messages[responseData.chat.messages.length - 1];
        if (lastMsg) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: lastMsg.content,
              timestamp: new Date(),
            },
          ]);
        }
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
    formData.append("userId", user._id);

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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateResponse = async (content) => {
    toast.success("Regenerating response...");
    // Implement regenerate logic if needed
  };

  const handleAudioToggle = () => {
    toast.success("Audio feature coming soon!");
  };

  return (
    <div className="flex flex-col h-full transition-all duration-300 ease-in-out">
      <ScrollArea className="flex-1 p-4">
        {!imgSelected ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*,.pdf"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-4"
              disabled={loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF or Image
            </Button>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, JPEG, PNG
            </p>
          </div>
        ) : (
          <div className="space-y-6 transition-all duration-300 ease-in-out">
            {uploadedFile && (
              <div className="flex items-center justify-between p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  {uploadedFile.type.startsWith("image/") ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : (
                    <File className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {uploadedFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="hover:bg-black-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className="space-y-4 transition-all duration-300 ease-in-out"
              >
                {index === 0 && (
                  <div className="text-center text-sm text-gray-500">Today</div>
                )}
                <div
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } gap-3`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="w-7 h-7">
                      <AvatarFallback>J</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">
                        {msg.role === "user" ? "You" : "Response"}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs ${
                        msg.role === "user"
                          ? "bg-blue-600"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <ReactMarkdown
                        className="formatted-content prose prose-sm max-w-none"
                        remarkPlugins={[remarkGfm]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {msg.role === "assistant" && (
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2"></div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleGenerateResponse(msg.content)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleCopy(msg.content)}
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={handleAudioToggle}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-3">
                <Avatar className="w-7 h-7">
                  <AvatarFallback>J</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] px-4 py-2 rounded-lg">
                  <Skeleton className="w-[100px] h-[20px] rounded-full" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </ScrollArea>

      {imgSelected && (
        <div className="sticky bottom-0 p-4 transition-all duration-300 ease-in-out">
          <div className="max-w-4xl mx-auto flex gap-4">
            <div className="flex-1 flex items-center gap-2 rounded-lg border p-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask questions about your document..."
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBoxForDocs;
