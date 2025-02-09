"use client";

import { useContext, useEffect, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FiTrash } from "react-icons/fi";
import { LucidePin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastProvider } from "./ui/toast";

const ChatList = ({ currentTab }) => {
  const { toast } = useToast();
  const { user, setSelectedChat, selectedChat, chats, setChats } =
    useContext(MyContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      // Use user._id as the unique identifier
      if (!user?._id) return;
      setIsLoading(true);
      try {
        const data = await fetch(
          `https://juristo-backend-azure.vercel.app/api/${
            currentTab === "analysis" ? "image-chat" : "chat"
          }/${user._id}`
        ).then((res) => res.json());
        setChats(data.reverse());
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast({
          title: "Failed to fetch chats",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, [user, currentTab, setChats, toast]);

  const deleteChat = async (chatId) => {
    setChatToDelete(chatId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://juristo-backend-azure.vercel.app/api/${
          currentTab === "analysis" ? "image-chat" : "chat"
        }/${chatToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setChats((prevChats) =>
          prevChats.filter((chat) => chat.chatId !== chatToDelete)
        );
        if (selectedChat?.chatId === chatToDelete) setSelectedChat(null);
        toast({
          title: "Chat deleted successfully",
        });
      } else {
        toast({
          title: "Failed to delete chat",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "An error occurred",
        description: "Failed to delete the chat.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const pinChat = (chatId) => {
    setPinnedChats((prev) => {
      if (prev.includes(chatId)) {
        return prev.filter((id) => id !== chatId);
      } else {
        return [chatId, ...prev];
      }
    });
  };

  const clearAllChats = () => {
    setChats([]);
    setSelectedChat(null);
    toast({
      title: "All chats cleared",
    });
    setShowClearConfirm(false);
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.description &&
        chat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedChats = [
    ...pinnedChats
      .map((id) => chats.find((chat) => chat.chatId === id))
      .filter(Boolean),
    ...filteredChats.filter((chat) => !pinnedChats.includes(chat.chatId)),
  ];

  const ChatItemSkeleton = () => (
    <div className="mb-4 p-3 rounded-lg shadow bg-card">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <>
      <div className="flex h-full flex-col bg-background border-l">
        <div className="border-b p-4">
          <h2 className="mb-4 font-bold">My Chats</h2>
          <div className="relative">
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 relative">
          <div className="p-4 pb-16">
            {isLoading ? (
              <>
                <ChatItemSkeleton />
                <ChatItemSkeleton />
                <ChatItemSkeleton />
              </>
            ) : (
              sortedChats.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`mb-4 p-3 rounded-lg shadow transition-colors cursor-pointer hover:bg-accent ${
                    chat.chatId === selectedChat?.chatId
                      ? "bg-muted"
                      : "bg-card"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{chat.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        className={`text-yellow-500 hover:text-yellow-700 ${
                          pinnedChats.includes(chat.chatId) && "text-yellow-700"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          pinChat(chat.chatId);
                        }}
                      >
                        <LucidePin size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.chatId);
                        }}
                      >
                        <FiTrash size={16} />
                      </Button>
                    </div>
                  </div>
                  <small className="text-sm text-muted-foreground">
                    {new Date(chat.createdAt).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </ScrollArea>
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowClearConfirm(true)}
          >
            Clear All Chats
          </Button>
        </div>

        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Chats</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear all chats? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllChats}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chat? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteChat}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <ToastProvider />
    </>
  );
};

export default ChatList;
