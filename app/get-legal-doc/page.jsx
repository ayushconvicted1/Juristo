"use client";

import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "@/context/MyContext";
import { format } from "date-fns";
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
import { toast } from "react-hot-toast";
import { HashLoader } from "react-spinners";

import cn from "classnames";

const ChatBot = () => {
  const { user } = useContext(MyContext);
  const chatEndRef = useRef(null);
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

  useEffect(() => {
    if (!user || !user.userId) {
      console.warn(
        "User is not initialized or missing user ID. Ensure proper context setup."
      );
      toast.error("User information is incomplete. Please log in again.");
      // You might want to redirect to login page here
    }
  }, [user]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchQuestions = async () => {
    if (!user || !user.country || !user.userId) {
      toast.error("User information is missing. Please log in.");
      return;
    }

    if (!userInput.trim()) {
      toast.error(
        "Please provide a description of the legal document you need."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/legaldocs/questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput,
            country: user.country.label,
            userId: user.userId,
          }),
        }
      );

      if (response.ok) {
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
      } else {
        toast.error("Failed to fetch questions.");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Unable to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer.");
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

  const handleGenerate = async (answersToGenerate) => {
    if (!user || !user.userId || !user.country) {
      console.error("User information incomplete:", { user });
      toast.error("User information is incomplete. Please log in.");
      return;
    }

    if (!userInput.trim()) {
      console.error("User input is missing");
      toast.error(
        "Please provide a description of the legal document you need."
      );
      return;
    }

    try {
      setPdfGenerating(true);
      setLoading(true);
      console.log("Starting document generation");
      toast.loading("Generating your legal document...");
      console.log("User:", user.userId);
      const requestPayload = {
        userId: user.userId,
        answers: Array.isArray(answersToGenerate) ? answersToGenerate : [],
        country: user.country ? user.country.label : null,
        userInput: userInput.trim(),
      };

      console.log("Request payload:", requestPayload);

      if (!requestPayload.country) {
        console.error("Country is missing");
        toast.error("Country is required.");
        return;
      }

      console.log("Sending request to backend");
      const response = await fetch(
        "https://juristo-backend-azure.vercel.app/api/legaldocs/generate",
        // "http://localhost:5000/api/legaldocs/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
          mode: "no-cors",
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Backend Error:", errorDetails);
        throw new Error(errorDetails.error || "Failed to generate document");
      }

      const data = await response.json();
      console.log("Received data from backend:", Object.keys(data));

      setQuestions([]);

      if (data.pdf) {
        console.log("Creating PDF blob");
        const pdfBlob = new Blob(
          [Uint8Array.from(atob(data.pdf), (c) => c.charCodeAt(0))],
          { type: "application/pdf" }
        );
        const pdfUrl = URL.createObjectURL(pdfBlob);
        console.log("PDF URL created:", pdfUrl);
        setPdfUrl(pdfUrl);

        // Trigger automatic download
        console.log("Triggering automatic download");
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "legal_document.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("Download triggered");
      } else {
        console.error("PDF data not found in the response");
        toast.error("PDF data not found in the response");
      }

      if (data.docx) {
        console.log("Creating DOCX blob");
        const docxUrl = URL.createObjectURL(
          new Blob([Uint8Array.from(atob(data.docx), (c) => c.charCodeAt(0))], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          })
        );
        console.log("DOCX URL created:", docxUrl);
        setDocxUrl(docxUrl);
      } else {
        console.error("DOCX data not found in the response");
        toast.error("DOCX data not found in the response");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I've generated your legal document. You can preview it below. The PDF download should start automatically.",
          timestamp: new Date(),
          hasPdf: true,
        },
      ]);

      console.log("Document generation complete");
      toast.success("Legal document generated successfully!");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error(`Unable to generate document: ${error.message}`);
    } finally {
      setLoading(false);
      setPdfGenerating(false);
      console.log("Generation process finished");
      toast.dismiss();
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) {
      toast.error(
        "Please provide a description of the legal document you need."
      );
      return;
    }
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userInput, timestamp: new Date() },
    ]);

    await fetchQuestions();
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
                          onClick={() => handleCopy(msg.content)}
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
                            console.log("Manual PDF download clicked");
                            toast.success("Manual PDF download started");
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
                              console.log("DOCX download clicked");
                              toast.success("DOCX download started");
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

      <div className="sticky bottom-0 bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border p-2">
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
              className="flex-1 border-0 focus-visible:ring-0 bg-white focus-visible:ring-offset-0"
            />
            <Button variant="ghost" size="icon">
              <Mic className="h-5 w-5 text-gray-400" />
            </Button>
            <Button
              onClick={questions.length > 0 ? handleAnswerSubmit : handleSend}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
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
