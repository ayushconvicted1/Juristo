"use client";

import { useContext, useState, useEffect, useRef } from "react";
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
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { HashLoader } from "react-spinners";
import cn from "classnames";

// Import your ZeptoMail-based sendmail controller function
import { sendUsageNotificationEmail } from "../../lib/mails/emailTem.js";

const ChatBot = () => {
  const { toast } = useToast();
  const { user, setChats, chats } = useContext(MyContext);
  const chatEndRef = useRef(null);

  // Local state variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [docxUrl, setDocxUrl] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentTab, setCurrentTab] = useState("drafting");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [draftChatId, setDraftChatId] = useState(null);

  // Verify that the user data is present
  useEffect(() => {
    if (!user || !user._id) {
      console.warn(
        "User is not initialized or missing user ID. Ensure proper context setup."
      );
      toast({
        title: "User Information Incomplete",
        description: "Please log in again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * Saves the current message as a draft chat.
   * When newChat is true, it creates a new draft chat (and updates the draftChatId and chat list);
   * otherwise, it updates the existing draft chat.
   */
  const saveDraftChat = async (message, newChat = false) => {
    if (!user?._id) return;
    try {
      console.log("Saving draft chat:", {
        newChat,
        currentDraftId: draftChatId,
        message,
      });
      const response = await fetch("/api/draftchats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          message,
          newChat,
          chatId: newChat ? null : draftChatId,
          country: user.country?.label || "Unknown",
          language: user.language?.label || "English",
        }),
      });
      const data = await response.json();
      console.log("Draft chat saved:", data);
      if (newChat && data.chat) {
        setDraftChatId(data.chat.chatId);
        // Update the shared chat list immediately (prepend new draft)
        setChats((prevChats) => [data.chat, ...prevChats]);
      } else if (!newChat && data.chat) {
        // Optionally update the existing chat in context if needed
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.chatId === data.chat.chatId ? data.chat : chat
          )
        );
      }
      return data.chat;
    } catch (error) {
      console.error("Error saving draft chat:", error);
    }
  };

  /**
   * Update the draft count by calling the server endpoint.
   * Based on the updated count, send an email notification.
   * At 100% usage, show an upgrade dialog.
   * @returns {Promise<boolean>} true if processing can continue, false if upgrade is required.
   */
  const updateDraftCountAndNotify = async () => {
    try {
      const response = await fetch(
        "https://juristo-backend-phi.vercel.app/api/users/updated",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update draft count");
      }
      const data = await response.json();
      const count = data.draftCount;
      console.log("Draft count updated (server):", count);

      if (count === 10) {
        console.log(
          "50% usage reached. Sending email notification for 50% usage."
        );
        await sendUsageNotificationEmail("50%", user.email);
      } else if (count >= 20) {
        console.log(
          "100% usage reached. Sending email notification for 100% usage."
        );
        await sendUsageNotificationEmail("100%", user.email);
        const upgrade = window.confirm(
          "You have reached 100% usage of your document drafts. Please upgrade to premium to continue using the service."
        );
        if (!upgrade) {
          toast({
            title: "Upgrade Required",
            description: "Upgrade to premium to continue using the service.",
            variant: "destructive",
          });
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error("Error updating draft count:", err);
      return true; // Continue even if there's an error updating usage
    }
  };

  // Function to fetch questions for generating the document
  const fetchQuestions = async () => {
    if (!user || !user.country || !user._id) {
      toast({
        title: "User Information Missing",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description:
          "Please provide a description of the legal document you need.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        "https://juristo-backend-phi.vercel.app/api/legaldocs/questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput,
            country: user.country.label,
            userId: user._id,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I've analyzed your request. Please answer the following questions to help me generate the appropriate legal document.",
            timestamp: new Date(),
          },
          {
            role: "assistant",
            content: data.questions[0],
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Unable to fetch questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit an answer for the current question
  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer.",
        variant: "destructive",
      });
      return;
    }
    const newAnswers = [
      ...answers,
      {
        question: questions[currentQuestionIndex],
        answer: currentAnswer.trim(),
      },
    ];
    setAnswers(newAnswers);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: currentAnswer.trim(), timestamp: new Date() },
    ]);
    // If in drafting mode, update the draft chat with the new answer
    if (currentTab === "drafting") {
      await saveDraftChat(currentAnswer, false);
    }
    setCurrentAnswer("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: questions[currentQuestionIndex + 1],
          timestamp: new Date(),
        },
      ]);
    } else {
      handleGenerate(newAnswers);
    }
  };

  // Generate the legal document based on answers
  const handleGenerate = async (answersToGenerate) => {
    if (!user || !user._id || !user.country) {
      console.error("User information incomplete:", { user });
      toast({
        title: "User Information Incomplete",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!userInput.trim()) {
      console.error("User input is missing");
      toast({
        title: "Input Required",
        description:
          "Please provide a description of the legal document you need.",
        variant: "destructive",
      });
      return;
    }
    try {
      setPdfGenerating(true);
      setLoading(true);
      console.log("Starting document generation");
      toast({
        title: "Generating Document",
        description: "Please wait while we generate your legal document...",
      });
      const requestPayload = {
        userId: user._id,
        answers: Array.isArray(answersToGenerate) ? answersToGenerate : [],
        country: user.country?.label || "Unknown",
        userInput: userInput.trim(),
      };
      console.log("Request Payload:", requestPayload);
      if (!requestPayload.country || requestPayload.country === "Unknown") {
        console.error("Country is missing or invalid in payload");
        throw new Error(
          "Valid country information is required to generate the document."
        );
      }
      // Send request to backend (adjust the endpoint as needed)
      const response = await fetch("/api/legaldocs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown backend error." }));
        console.error("Backend error response:", errorData);
        throw new Error(errorData.error || "Failed to generate document.");
      }
      const data = await response.json();
      console.log("Response from backend:", data);
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        // Update the draft count on the server and check usage thresholds.
        const canProceed = await updateDraftCountAndNotify();
        if (!canProceed) return; // Stop further processing if the user declines to upgrade.
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Your document has been successfully generated. You can access it below:",
            timestamp: new Date(),
            documentLink: data.pdfUrl,
            hasPdf: true,
          },
        ]);
        toast({
          title: "Success",
          description: "Your legal document has been generated successfully.",
          variant: "success",
        });
      } else {
        console.error("PDF URL missing in the backend response");
        throw new Error("PDF URL not found in the response.");
      }
    } catch (error) {
      console.error("Error during document generation:", error);
      toast({
        title: "Error",
        description: `Unable to generate document: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPdfGenerating(false);
      console.log("Document generation process completed");
    }
  };

  // Called when the user presses "Send" without any questions
  const handleSend = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description:
          "Please provide a description of the legal document you need.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userInput, timestamp: new Date() },
    ]);
    // If in drafting mode, store the initial draft chat message
    if (currentTab === "drafting") {
      const chat = await saveDraftChat(userInput, true);
      if (chat) {
        console.log("Initial draft chat stored:", chat);
      }
    }
    await fetchQuestions();
  };

  // Placeholder for regenerating a response (if needed)
  const handleGenerateResponse = async (content) => {
    toast.success("Regenerating response...");
    // Add your regeneration logic here if needed.
  };

  // Toggle text-to-speech (placeholder)
  const handleAudioToggle = () => {
    toast.success("Audio feature coming soon!");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className="space-y-4">
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
                        ? "bg-gradient-to-br from-[#0A2540] to-[#144676] p-4 text-white"
                        : "p-4"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 rounded-full"
                          onClick={() => handleGenerateResponse(msg.content)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 rounded-full"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(msg.content)
                              .then(() => toast.success("Copied to clipboard"))
                              .catch(() => toast.error("Failed to copy"));
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 rounded-full"
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
              {msg.hasPdf && (
                <div className="ml-10 mt-4">
                  {pdfGenerating ? (
                    <div className="flex flex-col items-center justify-center h-[400px] rounded-lg border border-gray-200 bg-gray-50">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="mt-2 text-sm text-gray-600">
                        Generating PDF... This may take up to 5 minutes.
                      </span>
                    </div>
                  ) : pdfUrl ? (
                    <>
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="text-sm font-medium">
                          Generated Legal Document
                        </span>
                      </div>
                      <iframe
                        src={pdfUrl}
                        className="w-full h-[400px] rounded-lg border border-gray-200"
                        title="Generated Document"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          asChild
                          onClick={() => {
                            toast({
                              title: "Download Started",
                              description: "Manual PDF download started",
                              variant: "success",
                            });
                          }}
                        >
                          <a href={pdfUrl} download="legal_document.pdf">
                            Download PDF (Manual)
                          </a>
                        </Button>
                        {docxUrl && (
                          <Button
                            variant="outline"
                            asChild
                            onClick={() => {
                              toast({
                                title: "Download Started",
                                description: "DOCX download started",
                                variant: "success",
                              });
                            }}
                          >
                            <a href={docxUrl} download="legal_document.docx">
                              Download DOCX
                            </a>
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] rounded-lg border border-gray-200 bg-gray-50">
                      <span className="text-sm text-gray-600">
                        PDF not available
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-100">
                <Skeleton className="w-[250px] h-[20px] rounded-full" />
                <div className="mt-2 text-xs text-gray-500">
                  Generating... This may take up to 5 minutes.
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 p-4">
        {/* Only show the image when there are no chat messages */}
        {messages.length === 0 && (
          <img
            src="https://img.freepik.com/free-vector/notary-service-online-service-platform-professional-lawyer-signing-legalizing-paper-document-online-information-isolated-flat-vector-illustration_613284-1891.jpg"
            alt="Notary Service Illustration"
            className="w-40 h-40 object-contain flex justify-center items-center mx-auto"
          />
        )}
        <div className="max-w-4xl mx-auto flex gap-4">
          <div className="flex-1 flex items-center gap-2 rounded-lg border p-2">
            <Input
              type="text"
              value={questions.length > 0 ? currentAnswer : userInput}
              onChange={(e) =>
                questions.length > 0
                  ? setCurrentAnswer(e.target.value)
                  : setUserInput(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (questions.length > 0 ? handleAnswerSubmit() : handleSend())
              }
              placeholder={
                questions.length > 0
                  ? "Type your answer..."
                  : "Describe the legal document you need..."
              }
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button variant="ghost" size="icon">
              <Mic className="h-5 w-5 text-gray-400" />
            </Button>
            <Button
              onClick={questions.length > 0 ? handleAnswerSubmit : handleSend}
              disabled={loading}
              className="bg-gradient-to-br from-[#0A2540] to-[#144676] p-4 text-white hover:bg-blue-700"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
