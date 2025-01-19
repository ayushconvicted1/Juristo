"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Flag,
  Mic,
  Moon,
  Plus,
  Settings,
  MessageSquare,
  HelpCircle,
  Sun,
  ChevronDown,
} from "lucide-react";
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
import { useTheme } from "next-themes";
import ChatList from "./ChatList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import countries from "world-countries";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const countryOptions = countries.map((country) => ({
  name: country.name.common,
  flag: `https://flagcdn.com/w40/${country.cca2.toLowerCase()}.png`,
}));
const defaultCountry =
  countryOptions.find((country) => country.name === "India") ||
  countryOptions[0];

export default function ChatBox() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("chat");
  const [showFeatures, setShowFeatures] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const { user, selectedChat, selectedLanguage, fetchChats, setSelectedChat } =
    useContext(MyContext);

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
    console.log("Current theme:", theme);
  }, [theme]);

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

  useEffect(() => {
    const scrollArea = document.querySelector(".scroll-area");
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
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
      country: selectedCountry.name,
      language: selectedLanguage.label || user?.language.label,
    };

    try {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input, timestamp: new Date() },
      ]);
      setInput("");

      // Add a loading message for the assistant's response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date(),
          loading: true,
        },
      ]);

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

        // Replace the loading message with the actual response
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
      }

      setLoading(false);
      fetchChats(user);
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      // Remove the loading message if there's an error
      setMessages((prev) => prev.slice(0, -1));
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
      country: selectedCountry.name,
      language: selectedLanguage.label || user?.language.label,
    };

    try {
      // Add a loading message for the assistant's response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date(),
          loading: true,
        },
      ]);

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

        // Replace the loading message with the actual response
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

      setLoading(false);
      fetchChats(user);
    } catch (error) {
      console.error("Error generating response:", error);
      setLoading(false);
      // Remove the loading message if there's an error
      setMessages((prev) => prev.slice(0, -1));
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
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0  border-b p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div /> {/* Empty div for spacing */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                {/* Trigger Button */}
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-md  shadow-sm ">
                    <Image
                      src={selectedCountry.flag}
                      alt={`${selectedCountry.name} flag`}
                      width={20}
                      height={15}
                      className="rounded-sm"
                    />
                    <span className="text-sm font-medium">
                      {selectedCountry.name}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>

                {/* Dropdown Content */}
                <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto  border rounded-md shadow-lg">
                  {countryOptions.map((country) => (
                    <DropdownMenuItem
                      key={country.name}
                      onSelect={() => setSelectedCountry(country)}
                      className="flex items-center gap-2 px-4 py-2  cursor-pointer"
                    >
                      <Image
                        src={country.flag}
                        alt={`${country.name} flag`}
                        width={20}
                        height={15}
                        className="rounded-sm"
                      />
                      <span>{country.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div /> {/* Empty div for spacing */}
          </div>
        </div>

        <ScrollArea className="flex-1 scroll-area">
          <div className="p-4">
            <div className="p-4 flex justify-center">
              <Tabs
                value={currentTab}
                className="w-full max-w-2xl justify-center items-center flex"
                onValueChange={(value) => setCurrentTab(value)}
              >
                <TabsList className="bg-gray-100 p-1 rounded-full mx-auto">
                  <TabsTrigger
                    value="chat"
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
                    value="analysis"
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

            {/* Main Content Area */}
            <div className="mt-8">
              {showFeatures && (
                <>
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">
                      How can we <span className="text-blue-600">assist</span>{" "}
                      you today?
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
                <div className="space-y-6">
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
                          </div>
                          {msg.loading ? (
                            <div className="px-3 py-1.5 rounded-lg text-xs ">
                              <Skeleton className="w-[200px] h-[12px]" />
                              <Skeleton className="w-[150px] h-[12px] mt-1" />
                              <Skeleton className="w-[100px] h-[12px] mt-1" />
                            </div>
                          ) : (
                            <div
                              className={`px-3 py-1.5 rounded-lg text-xs ${
                                msg.role === "user"
                                  ? "bg-gradient-to-br from-[#0A2540] to-[#144676] p-4 text-white"
                                  : "bg-gradient-to-br from-[#0A2540] to-[#144676] p-4 text-white"
                              }`}
                            >
                              {msg.role === "user" ? (
                                msg.content
                              ) : (
                                <ReactMarkdown
                                  className="formatted-content prose prose-sm max-w-none"
                                  remarkPlugins={[remarkGfm]}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              )}
                            </div>
                          )}
                          {msg.role === "assistant" && !msg.loading && (
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
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {currentTab === "chat" && (
          <div className="p-4 border-t">
            <div className="max-w-4xl mx-auto flex gap-4">
              <div className="flex-1 flex items-center gap-2  rounded-lg border p-2">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask questions for your legal help"
                  className="flex-1 border-0 focus-visible:ring-0  focus-visible:ring-offset-0"
                />
                <Button variant="ghost" size="icon">
                  <Mic className="h-5 w-5 text-gray-400" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-gradient-to-br from-[#0A2540] to-[#144676] p-4 text-white hover:bg-blue-700"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Chat List */}
      <div className="w-80 border-l">
        <ChatList currentTab={currentTab} />
      </div>
    </div>
  );
}
