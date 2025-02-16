"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MyContext } from "@/context/MyContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Sun,
  Moon,
  LogOut,
  User,
  Mail,
  Calendar,
  Globe,
  Languages,
  MessageCircle,
  Rocket,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, loading, setUser } = useContext(MyContext); // Ensure setUser is available in context
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Redirect to login if token or user is missing
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!loading && (!token || !storedUser)) {
      setUser(null); // Clear user context
      router.push("/login");
    } else if (storedUser) {
      setUser(JSON.parse(storedUser)); // Sync user context with localStorage
    }
  }, [loading, router, setUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Clear user context
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const goToChats = () => {
    router.push("/"); // Adjust if your chats page is at a different route
  };

  // Mapping active plan details
  const planDetails = {
    basic: {
      name: "Basic",
      price: "Free",
      description: "Ideal for individuals and small businesses.",
    },
    super: {
      name: "Super",
      price: "₹199/month",
      description: "Perfect for growing businesses and startups.",
    },
    advance: {
      name: "Advance",
      price: "₹399/month",
      description: "Best for enterprises requiring robust solutions.",
    },
  };

  // Get current plan details (default to basic if none)
  const currentPlan = user?.plan
    ? planDetails[user.plan.toLowerCase()]
    : planDetails.basic;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[200px]" />
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-200">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={goToChats}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Go to Chats
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {/* Updated grid to 3 columns on medium screens */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-gray-200">
              <User className="h-5 w-5" />
              Profile Information
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Joined
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Country
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {user?.country?.label || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Language
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {user?.language?.label || "English"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Plan Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-gray-200">
              <Rocket className="h-5 w-5 text-purple-500" />
              Active Plan
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium dark:text-gray-200">
              {currentPlan.name}{" "}
              {currentPlan.price !== "Free" && `- ${currentPlan.price}`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentPlan.description}
            </p>
          </CardContent>
        </Card>

        {/* Coming Soon Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-gray-200">
              <Rocket className="h-5 w-5 text-purple-500" />
              Exciting Updates Ahead!
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 animate-pulse">
                <div className="h-24 w-24 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <Rocket className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">
                New Features Coming Soon!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We're working hard to bring you exciting new features. Stay
                tuned for amazing updates that will enhance your experience!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm text-purple-600 dark:text-purple-300">
                <span className="animate-pulse">🚀</span>
                <span className="ml-2">Launching Summer 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
