"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageSquarePlus,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Code,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const router = useRouter();
  const {
    user,
    setSelectedChat,
    selectedChat,
    chats,
    setChats,
    setUser,
    setMessages,
  } = useContext(MyContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Clear any other stored data
      localStorage.clear();
    }
    router.push("/login");
    setUser(null);
    setMessages([]);
    setSelectedChat(null);
  };

  const navItems = [
    {
      icon: MessageSquarePlus,
      label: "Start new chat",
      onClick: () => setSelectedChat(null),
    },
    {
      icon: MessageSquare,
      label: "AI chat",
      onClick: () => {
        const newChat = {
          id: Date.now().toString(),
          title: "New AI Chat",
          description: "Start a new conversation with AI",
          time: new Date().toLocaleTimeString(),
          isNew: true,
          messages: [],
        };
        setSelectedChat(newChat);
      },
      isActive: true,
    },
    {
      icon: Code,
      label: "API",
      onClick: () => router.push("/apidocs"),
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => setShowSettings(true),
    },
    {
      icon: HelpCircle,
      label: "Updates and FAQ",
      onClick: () => setShowHelp(true),
    },
  ];

  const handleclick = () => {
    router.push("/");
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r py-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg font-bold">
          <img
            src="https://res.cloudinary.com/dc9msi1wn/image/upload/v1737221626/LOGO_1_nj85xe.png"
            alt="juristo"
            className="h-8 w-8"
          />
        </div>
        <button
          className="text-xl font-medium tracking-tight bg-transparent shadow-none"
          onClick={handleclick}
        >
          Juristo
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:bg-accent",
              item.isActive && "text-blue-600"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Premium Section */}
      <div className="px-4 mt-auto">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#0A2540] to-[#144676] p-4 text-white">
            <h3 className="font-semibold">Go Premium Now!</h3>
            <p className="text-xs text-white/80">
              Get your legal work easily done
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">
                $70{" "}
                <span className="text-xs font-normal text-white/80">
                  /month
                </span>
              </span>
              <Button
                size="sm"
                className="h-7 bg-white text-[#0A2540] hover:bg-white/90"
              >
                Get
              </Button>
            </div>
          </div>
        </Card>

        {/* User Profile and Logout */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user?.name || "Guest"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {/* Link to Dashboard */}
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <Settings className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
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

      {/* Help Dialog */}
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
