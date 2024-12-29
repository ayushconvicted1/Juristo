"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageSquarePlus,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MyContext } from "@/context/MyContext";

export default function SIdebar() {
  const { user, setSelectedChat, selectedChat, chats, setChats } =
    useContext(MyContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex h-full flex-col border-r bg-background p-4">
      <div className="flex items-center gap-2 pb-4">
        <div className="h-8 w-8 rounded-lg bg-primary" />
        <h1 className="text-xl font-bold">Juristo</h1>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Button
          variant="ghost"
          className="justify-start gap-2"
          onClick={() => setSelectedChat(null)}
        >
          <MessageSquarePlus className="h-5 w-5" />
          Start new chat
        </Button>

        <Button
          variant="ghost"
          className="justify-start gap-2"
          onClick={() => {
            const newChat = {
              id: Date.now().toString(),
              title: "New AI Chat",
              description: "Start a new conversation with AI",
              time: new Date().toLocaleTimeString(),
              isNew: true,
              messages: [],
            };
            setActiveChat(newChat);
          }}
        >
          <MessageSquare className="h-5 w-5" />
          AI chat
        </Button>
        <Button
          variant="ghost"
          className="justify-start gap-2"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="destructive"
          onClick={async () => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
            }
            setUser(null);
            setMessages([]);
            setSelectedChat(null);
            router.push("/login");
          }}
        >
          Log Out
        </Button>
        <Button
          variant="ghost"
          className="justify-start gap-2"
          onClick={() => setShowHelp(true)}
        >
          <HelpCircle className="h-5 w-5" />
          Updates and FAQ
        </Button>
      </div>
      <div className="p-4 border-t">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg p-4">
          <h3 className="font-bold">Go Premium Now!</h3>
          <p className="text-sm">Get your legal work easily done</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold">$70 /month</span>
            <Button size="sm" variant="secondary">
              Get
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <h3 className="font-medium">Settings will be added soon</h3>
            </div>
            <div className="grid gap-2">
              <h3 className="font-medium">Notifications</h3>
              <Button variant="outline">Manage Notifications</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Updates and FAQ</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Latest Updates</h3>
              <p className="text-sm text-muted-foreground">
                Version 2.0 is now available with improved AI capabilities
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">FAQ</h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>How do I start a new chat?</li>
                <li>What are the premium features?</li>
                <li>How does the AI assistant work?</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
