"use client";

import { MyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, Flag, Mic, RefreshCw, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "./ui/skeleton";
import DocsChat from "./DocsChat";
import ChatList from "./ChatList";
import ChatBoxForDocs from "./ChatBotForImage";
import ChatBot from "@/app/get-legal-doc/page";

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
  const [currentTab, setCurrentTab] = useState("chat");

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
      const filteredMessages = selectedChat.messages.filter(
        (msg) => !msg.content.startsWith("You are a Legal AI Assistant")
      );
      setMessages(filteredMessages);
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
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setInput("");
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        }
      );
      const responseData = await response.json();

      if (responseData && responseData.response) {
        const aiResponse = responseData.response
          .replace(/^You are a Legal AI Assistant[\s\S]*?(?=\n\n|$)/, "")
          .trim();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse },
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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    // Handle the file upload logic (e.g., sending it to an API or saving it)
    console.log("Uploaded file:", file);
  };

  const features = [
    {
      title: "Chats",
      description: "Talk to the assistant",
      onClick: () => setCurrentTab("chat"),
    },
    {
      title: "Analysis",
      description: "Upload documents for analysis",
      onClick: () => setCurrentTab("analysis"),
    },
    {
      title: "Drafting",
      description: "Create and edit legal documents",
      onClick: () => setCurrentTab("drafting"),
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center w-full min-h-screen bg-gray-50">
        <div className="w-full max-w-6xl px-4 py-8">
          {/* Navigation Tabs */}
          <Tabs value={currentTab} className="mb-8">
            <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-auto">
              <TabsTrigger value="chat" onClick={() => setCurrentTab("chat")}>
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                onClick={() => setCurrentTab("analysis")}
              >
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="drafting"
                onClick={() => setCurrentTab("drafting")}
              >
                Drafting
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Logo */}

          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="w-10 h-10 bg-[#0A0F1C] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              J
            </div>
            <span className="text-2xl font-bold">Juristo</span>
          </div>

          {/* Main Content */}
          <div className="space-y-6 mb-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">
                How can we <span className="text-blue-600">assist</span> you
                today?
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Empower law students and professionals with real-time learning.
                Simplify complex cases and stay updated with AI-generated
                summaries.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 cursor-pointer transition-all hover:shadow-md hover:bg-gray-50"
                  onClick={feature.onClick}
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 flex-grow mb-4">
                      {feature.description}
                    </p>
                    <Button variant="ghost" className="w-fit">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Chat or Analysis Section */}
            {currentTab === "chat" && (
              <div className="space-y-4 min-h-[200px]">
                {messages.map((msg, index) => (
                  <>
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </>
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
            )}
          </div>

          {/* Input Area (Only visible in the chat tab) */}
          {currentTab === "chat" && (
            <div className="fixed bottom-0 left-0 right-0 p-4 border-1">
              <div className="max-w-4xl mx-auto flex gap-4">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border p-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask questions for your legal help"
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
          {currentTab === "analysis" && <ChatBoxForDocs></ChatBoxForDocs>}
          {currentTab === "drafting" && <ChatBot></ChatBot>}
        </div>
      </div>
    </>
  );
};

export default ChatBox;
