"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, FileText, MessageSquare, Upload, Search, Pencil } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Home() {
    const [activeTab, setActiveTab] = useState("connection");

    const endpoints = [
        {
            id: "connection",
            name: "Connection",
            icon: <Code2 className="w-5 h-5" />,
            description: "Fetches the details of the user associated with the provided API key",
            method: "GET",
            path: "/connection",
            request: {
                headers: {
                    "x-api-key": "API key for authentication (optional if provided in query parameters)"
                },
                query: {
                    apiKey: "API key for authentication (optional if provided in headers)"
                }
            },
            response: {
                "name": "John Doe",
                "userId": "UID12345678",
                "subscription": "premium"
            },
            curl: 'curl -X GET https://api.juristo.com/connection \\\n  -H "x-api-key: 3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c"'
        },
        {
            id: "chat",
            name: "Chat",
            icon: <MessageSquare className="w-5 h-5" />,
            description: "Facilitates chat interactions with the Juristo Legal AI Assistant",
            method: "POST",
            path: "/chat",
            request: {
                headers: {
                    "Content-Type": "application/json"
                },
                query: {
                    apiKey: "API key for authentication (required)"
                },
                body: {
                    message: "What are the property dispute laws in India?",
                    country: "India",
                    language: "en",
                    context: []
                }
            },
            response: {
                status: "success",
                data: {
                    title: "Chat on 2025-01-19",
                    response: "Property disputes in India are governed by the Transfer of Property Act and various local state laws...",
                    chatId: "CID1674121234567"
                }
            },
            curl: 'curl -X POST "https://api.juristo.com/chat?apiKey=3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "message": "What are the property dispute laws in India?",\n    "country": "India",\n    "language": "en"\n  }\''
        },
        {
            id: "document_upload",
            name: "Upload Document",
            icon: <Upload className="w-5 h-5" />,
            description: "Upload and process legal documents for analysis",
            method: "POST",
            path: "/document",
            request: {
                headers: {
                    "x-api-key": "API key for authentication (required)"
                },
                body: {
                    file: "Document to be analyzed (PDF or image)"
                }
            },
            response: {
                documentId: "unique_document_id",
                title: "Document Title",
                content: "Extracted document content..."
            },
            curl: 'curl -X POST https://api.juristo.com/document \\\n  -H "x-api-key: 3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c" \\\n  -F "file=@/path/to/document.pdf"'
        },
        {
            id: "document_query",
            name: "Query Document",
            icon: <Search className="w-5 h-5" />,
            description: "Ask questions about previously uploaded documents",
            method: "POST",
            path: "/query",
            request: {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "API key for authentication (required)"
                },
                body: {
                    documentId: "unique_document_id",
                    question: "What is the legal process for property dispute resolution in India?"
                }
            },
            response: {
                data: "The document provided is an agreement between..."
            },
            curl: 'curl -X POST https://api.juristo.com/query \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: 3e8477c8c3dbc7b0fa05190908120bf123bbae3edb8aa21275e35a86eefac5c" \\\n  -d \'{\n    "documentId": "unique_document_id",\n    "question": "What is the legal process for property dispute resolution in India?"\n  }\''
        },
        {
            id: "drafting",
            name: "Drafting",
            icon: <Pencil className="w-5 h-5" />,
            description: "Generate legal document drafts",
            method: "POST",
            path: "/drafting/document",
            request: {
                headers: {
                    "x-api-key": "API key for authentication (required)",
                    "Content-Type": "application/json"
                },
                body: {
                    answers: ["array of strings"],
                    userInput: "string",
                    country: "string"
                }
            },
            response: {
                docx: "base64 encoded docx",
                pdf: "base64 encoded pdf"
            },
            curl: 'curl -X POST https://api.juristo.com/drafting/document \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -d \'{\n    "answers": ["answer1", "answer2"],\n    "userInput": "I want to draft a lease agreement",\n    "country": "India"\n  }\''
        }
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="w-[280px] flex-shrink-0">
                <Sidebar />
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <div className="container py-8 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-bold mb-4">Juristo API Documentation</h1>
                            <p className="text-lg text-muted-foreground">
                                Complete guide to integrating with the Juristo Legal AI Assistant
                            </p>
                        </div>

                        <Tabs defaultValue="connection" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full">
                                {endpoints.map((endpoint) => (
                                    <TabsTrigger
                                        key={endpoint.id}
                                        value={endpoint.id}
                                        className="flex items-center gap-2"
                                    >
                                        {endpoint.icon}
                                        <span className="hidden sm:inline">{endpoint.name}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {endpoints.map((endpoint) => (
                                <TabsContent key={endpoint.id} value={endpoint.id}>
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                {endpoint.icon}
                                                <div>
                                                    <CardTitle className="text-2xl">
                                                        {endpoint.method} {endpoint.path}
                                                    </CardTitle>
                                                    <CardDescription className="text-lg mt-1">
                                                        {endpoint.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Request</h3>
                                                    <Card>
                                                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                                            <pre className="text-sm">
                                                                {JSON.stringify(endpoint.request, null, 2)}
                                                            </pre>
                                                        </ScrollArea>
                                                    </Card>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Response</h3>
                                                    <Card>
                                                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                                            <pre className="text-sm">
                                                                {JSON.stringify(endpoint.response, null, 2)}
                                                            </pre>
                                                        </ScrollArea>
                                                    </Card>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Example Request</h3>
                                                    <Card>
                                                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
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