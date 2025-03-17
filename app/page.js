"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatBot from "@/components/ChatBot";
import ChatList from "@/components/ChatList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import "@/app/formatted-content.css";

export default function Home() {
  const [currentTab, setCurrentTab] = useState("chat");
  const [showFeatures, setShowFeatures] = useState(true);

  const switchTab = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className="flex gap-4 justify-center items-start h-screen">
      {/* Sidebar */}
      {/* <div className="flex-none lg:w-1/5 h-full overflow-y-auto">
        <Sidebar />
      </div> */}

      {/* Main ChatBot Section */}
      <div className="flex-1 h-full relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto">
          <ChatBot />
        </div>
      </div>

      {/* Chat List */}
    </div>
  );
}
