"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code2,
  FileText,
  MessageSquare,
  Upload,
  Search,
  Pencil,
  Menu,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [activeTab, setActiveTab] = useState("connection");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "text-green-600";
      case "POST":
        return "text-yellow-600";
      case "PUT":
        return "text-orange-600";
      case "DELETE":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const endpoints = [
    {
      id: "connection",
      name: "Connection",
      icon: <Code2 className="w-5 h-5" />,
      description:
        "Fetches the details of the user associated with the provided API key, including their name and subscription type. This endpoint is used to verify the connection and authentication status of the user.",
      method: "GET",
      path: "/connection",
      request: {
        headers: {
          "x-api-key":
            "API key for authentication (optional if provided in query parameters)",
        },
        query: {
          apiKey:
            "API key for authentication (optional if provided in headers)",
        },
      },
      response: {
        name: "John Doe",
        userId: "UID12345678",
        subscription: "premium",
      },
      curl: 'curl -X GET https://api.juristo.com/connection \\\n  -H "x-api-key: 3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c"',
    },
    {
      id: "chat",
      name: "Chat",
      icon: <MessageSquare className="w-5 h-5" />,
      description:
        "Facilitates chat interactions with the Juristo Legal AI Assistant. This endpoint processes user messages and responds based on the context provided. The chatId is used to maintain the conversation state.",
      method: "POST",
      path: "/chat",
      request: {
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          apiKey: "API key for authentication (required)",
        },
        body: {
          message: "What are the property dispute laws in India?",
          country: "India",
          language: "en",
          context: [],
        },
      },
      response: {
        status: "success",
        data: {
          title: "Chat on 2025-01-19",
          response:
            "Property disputes in India are governed by the Transfer of Property Act and various local state laws...",
          chatId: "CID1674121234567",
        },
      },
      curl: 'curl -X POST "https://api.juristo.com/chat?apiKey=3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "message": "What are the property dispute laws in India?",\n    "country": "India",\n    "language": "en"\n  }\'',
    },
    {
      id: "document_upload",
      name: "Upload Document",
      icon: <Upload className="w-5 h-5" />,
      description:
        "Allows users to upload a document (PDF or image) for analysis. The document's content is extracted and stored for later use. This endpoint returns the extracted content along with a title and the content of the document.",
      method: "POST",
      path: "/document",
      request: {
        headers: {
          "x-api-key": "API key for authentication (required)",
        },
        body: {
          file: "Document to be analyzed (PDF or image)",
        },
      },
      response: {
        documentId: "unique_document_id",
        title: "Document Title",
        content: "Extracted document content...",
      },
      curl: 'curl -X POST https://api.juristo.com/document \\\n  -H "x-api-key: 3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c" \\\n  -F "file=@/path/to/document.pdf"',
    },
    {
      id: "document_query",
      name: "Query Document",
      icon: <Search className="w-5 h-5" />,
      description:
        "Allows users to ask questions about a previously uploaded document. The assistant responds to the user's query based on the document context.",
      method: "POST",
      path: "/query",
      request: {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "API key for authentication (required)",
        },
        body: {
          documentId: "unique_document_id",
          question:
            "What is the legal process for property dispute resolution in India?",
        },
      },
      response: {
        data: "The document provided is an agreement between...",
      },
      curl: 'curl -X POST https://api.juristo.com/query \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: 3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c" \\\n  -d \'{\n    "documentId": "unique_document_id",\n    "question": "What is the legal process for property dispute resolution in India?"\n  }\'',
    },
    {
      id: "drafting_questions",
      name: "Questions",
      icon: <MessageSquare className="w-5 h-5" />,
      description:
        "Generates a set of key legal questions based on the user input and the relevant country. This helps in drafting legal documents by first identifying the crucial questions.",
      method: "POST",
      path: "/drafting/questions",
      request: {
        headers: {
          "x-api-key": "API key for authentication (required)",
          "Content-Type": "application/json",
        },
        body: {
          userInput:
            "I want a document to finalise renting a flat to two people",
          country: "India",
        },
      },
      response: {
        questions: [
          "1. Have both the parties agreed on the rental amount for the flat...",
          "2. Does the agreement specify the duration of the lease and...",
          "3. Are the responsibilities of both the tenant and the...",
          "4. Does the document outline the conditions under...",
        ],
      },
      curl: 'curl -X POST http://localhost:5001/drafting/questions \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: 3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c" \\\n  -d \'{\n    "userInput": "I want a document to finalise renting a flat to two people",\n    "country": "India"\n  }\'',
    },
    {
      id: "drafting_document",
      name: "Document",
      icon: <Pencil className="w-5 h-5" />,
      description:
        "Generates a legal document based on the answers to the questions generated. The result is provided in both PDF and DOCX formats as base64-encoded strings.",
      method: "POST",
      path: "/drafting/document",
      request: {
        headers: {
          "x-api-key": "API key for authentication (required)",
          "Content-Type": "application/json",
        },
        body: {
          answers: ["array of strings"],
          userInput: "string",
          country: "string",
        },
      },
      response: {
        docx: "base64 encoded docx",
        pdf: "base64 encoded pdf",
      },
      curl: 'curl -X POST https://api.juristo.com/drafting/document \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -d \'{\n    "answers": ["answer1", "answer2"],\n    "userInput": "I want to draft a lease agreement",\n    "country": "India"\n  }\'',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 bg-background z-50 border-r transform transition-transform duration-300 pt-[5%] lg:pt-[0] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-4">
                Juristo API Documentation
              </h1>
              <p className="text-lg text-muted-foreground">
                Complete guide to integrating with the{" "}
                <span className="text-blue-600">
                  Juristo Legal AI Assistant
                </span>
              </p>
            </div>

            <Tabs
              defaultValue="connection"
              className="w-full"
              onValueChange={setActiveTab}
            >
              {/* Tabs List */}
              <TabsList className="flex overflow-x-auto lg:grid lg:grid-cols-6 w-full mb-8">
                {endpoints.map((endpoint) => (
                  <TabsTrigger
                    key={endpoint.id}
                    value={endpoint.id}
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 whitespace-nowrap"
                  >
                    {endpoint.icon}
                    <span className="hidden sm:inline">{endpoint.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tabs Content */}
              {endpoints.map((endpoint) => (
                <TabsContent key={endpoint.id} value={endpoint.id}>
                  <Card>
                    <CardHeader className="border-b">
                      <div className="flex items-center gap-3">
                        {endpoint.icon}
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <span className={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </span>
                            <span className="text-muted-foreground">
                              {endpoint.path}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-lg mt-1">
                            {endpoint.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid gap-6">
                        {/* Request Section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Request
                          </h3>
                          <Card className="border-blue-50">
                            <ScrollArea className="h-auto max-h-[200px] w-full rounded-md border p-4">
                              <pre className="text-sm">
                                {JSON.stringify(endpoint.request, null, 2)}
                              </pre>
                            </ScrollArea>
                          </Card>
                        </div>

                        {/* Response Section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Response
                          </h3>
                          <Card className="border-blue-50">
                            <ScrollArea className="h-auto max-h-[200px] w-full rounded-md border p-4">
                              <pre className="text-sm">
                                {JSON.stringify(endpoint.response, null, 2)}
                              </pre>
                            </ScrollArea>
                          </Card>
                        </div>

                        {/* Example Request Section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Example Request
                          </h3>
                          <Card className="border-blue-50">
                            <ScrollArea className="h-auto max-h-[200px] w-full rounded-md border p-4">
                              <pre className="text-sm whitespace-pre-wrap">
                                {endpoint.curl}
                              </pre>
                            </ScrollArea>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
