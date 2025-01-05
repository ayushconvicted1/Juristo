"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Flag, Mic, Moon } from "lucide-react";
import { format } from "date-fns";
import { MyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageActions } from "@/components/message-actions";
import ChatBoxForDocs from "@/components/ChatBotForImage";
import ChatBot from "@/app/get-legal-doc/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import cn from "classnames";

export default function ChatBox() {
  const router = useRouter();
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("chat");
  const [showFeatures, setShowFeatures] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    user,
    selectedChat,
    selectedLanguage,
    selectedCountry,
    fetchChats,
    setSelectedChat,
  } = useContext(MyContext);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [user, router]);

  useEffect(() => {
    if (selectedChat) {
      const filteredMessages = selectedChat.messages
        .filter(
          (msg) => !msg.content.startsWith("You are a Legal AI Assistant")
        )
        .map((msg) => ({
          ...msg,
          timestamp: new Date(),
        }));
      setMessages(filteredMessages);
    } else {
      setMessages([]);
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
    setShowFeatures(false);

    const newMessage = {
      userId: user?.userId,
      message: input,
      newChat: !selectedChat,
      chatId: selectedChat?.chatId,
      country: selectedCountry.label || user?.country.label,
      language: selectedLanguage.label || user?.language.label,
    };

    try {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input, timestamp: new Date() },
      ]);
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
          { role: "assistant", content: aiResponse, timestamp: new Date() },
        ]);
      }

      if (responseData && responseData.chat) {
        setSelectedChat(responseData.chat);
      }

      setLoading(false);
      fetchChats(user);
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log("Message copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy message:", error);
      });
  };

  const handleGenerateResponse = async (userQuery) => {
    setLoading(true);

    const newMessage = {
      userId: user?.userId,
      message: userQuery,
      newChat: false,
      chatId: selectedChat?.chatId,
      country: selectedCountry.label || user?.country.label,
      language: selectedLanguage.label || user?.language.label,
    };

    try {
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
          { role: "assistant", content: aiResponse, timestamp: new Date() },
        ]);
      }

      setLoading(false);
      fetchChats(user);
    } catch (error) {
      console.error("Error generating response:", error);
      setLoading(false);
    }
  };

  const handleToggleAudio = () => {
    // Implement audio toggle logic
  };

  const features = [
    {
      title: "Research Assistance",
      description: "Lorem ipsum dolor sit amet, consectetur",
      onClick: () => setCurrentTab("chat"),
    },
    {
      title: "Case Prediction",
      description: "Lorem ipsum dolor sit amet, consectetur",
      onClick: () => setCurrentTab("analysis"),
    },
    {
      title: "Document Drafting",
      description: "Lorem ipsum dolor sit amet, consectetur",
      onClick: () => setCurrentTab("drafting"),
    },
    {
      title: "Multi jurisdictional",
      description: "Lorem ipsum dolor sit amet, consectetur",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full h-screen bg-gray-50">
      <div className="w-full max-w-6xl px-6 h-full flex flex-col">
        <ScrollArea
          className="flex-grow overflow-y-auto"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div
            className={cn(
              "transition-all duration-500 ease-in-out sticky top-0 bg-gray-50 backdrop-blur-sm z-10",
              showFeatures ? "py-6" : "py-3"
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-4 transition-all duration-500",
                showFeatures ? "items-center text-center" : "items-start"
              )}
            >
              <div
                className={cn(
                  "flex items-center transition-all duration-500",
                  showFeatures
                    ? "flex-col gap-4 w-full justify-center"
                    : "w-full justify-between"
                )}
              >
                {/* <h1
                  className={cn(
                    "font-semibold text-gray-900 transition-all duration-500",
                    showFeatures ? "text-xl" : "text-lg"
                  )}
                >
                  {selectedChat?.title || "New Chat"}
                </h1> */}
                <div className="flex items-center gap-4 bg-gray-50">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-full">
                    <span className="text-xsm font-medium">
                      Country : India
                    </span>
                    <Image
                      src="https://th.bing.com/th?id=OIP.RDVZ5zQLg2qa3FLO_4vqoAHaE5&w=307&h=203&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"
                      alt="India flag"
                      width={20}
                      height={15}
                      className="rounded-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-10 h-10"
                  >
                    <Moon className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="documentation" className="w-full">
                <TabsList
                  className={cn(
                    "bg-gray-100 p-1 rounded-full transition-all duration-500",
                    showFeatures ? "mx-auto" : "w-fit"
                  )}
                >
                  <TabsTrigger
                    value="documentation"
                    className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-[#0A0F1C] data-[state=active]:text-white"
                  >
                    Documentation
                  </TabsTrigger>
                  <TabsTrigger
                    value="drafting"
                    className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-[#0A0F1C] data-[state=active]:text-white"
                  >
                    Drafting
                  </TabsTrigger>
                  <TabsTrigger
                    value="case-prediction"
                    className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-[#0A0F1C] data-[state=active]:text-white"
                  >
                    Case Prediction
                  </TabsTrigger>
                  <TabsTrigger
                    value="multi-support"
                    className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-[#0A0F1C] data-[state=active]:text-white"
                  >
                    MultiSupport
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-center gap-3 transition-all duration-500",
              showFeatures ? "mb-8" : "mb-4"
            )}
          >
            <div className="w-12 h-12 bg-[#0A0F1C] rounded-xl flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold">
                J
              </div>
            </div>
            <span className="text-xl font-bold text-[#0A0F1C]">Juristo</span>
          </div>

          <div className="space-y-6 mb-12">
            {showFeatures && (
              <>
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold">
                    How can we <span className="text-blue-600">assist</span> you
                    today?
                  </h1>
                  <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                    Empower law students and professionals with real-time
                    learning. Simplify complex cases and stay updated with
                    AI-generated summaries.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                  {features.map((feature) => (
                    <Card
                      key={feature.title}
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={feature.onClick}
                    >
                      <CardContent className="p-4">
                        <h3 className="text-base font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                          {feature.description}
                        </p>
                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {currentTab === "analysis" && <ChatBoxForDocs />}
            {currentTab === "drafting" && <ChatBot />}
            {currentTab === "chat" && (
              <div className="space-y-6 min-h-[200px]">
                {messages.map((msg, index) => (
                  <div key={index} className="space-y-4">
                    {index === 0 && (
                      <div className="text-center text-sm text-gray-500">
                        Today
                      </div>
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
                            {format(msg.timestamp, "dd MMM • h:mm a")}
                          </span>
                          {index === messages.length - 1 && (
                            <span className="text-xs text-gray-500">
                              {currentPage}/{totalPages}
                            </span>
                          )}
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-lg text-xs ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.role === "assistant" && (
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-gray-100 rounded-full w-7 h-7 p-0"
                              >
                                😊
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-gray-100 rounded-full w-7 h-7 p-0"
                              >
                                ☹️
                              </Button>
                            </div>
                            <MessageActions
                              onCopy={() => handleCopy(msg.content)}
                              onGenerateResponse={() =>
                                handleGenerateResponse(
                                  messages[index - 1].content
                                )
                              }
                              onToggleAudio={handleToggleAudio}
                              content={msg.content}
                            />
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
                    <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-100">
                      <Skeleton className="w-[100px] h-[20px] rounded-full" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {currentTab === "chat" && (
          <div className="mt-4 pb-4">
            <div className="max-w-4xl mx-auto flex gap-4">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border p-2">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask questions for your legal help"
                  className="flex-1 border-0 focus-visible:ring-0 bg-white focus-visible:ring-offset-0"
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
    </div>
  );
}
