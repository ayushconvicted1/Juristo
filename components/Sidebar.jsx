"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageSquarePlus,
  Code,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboardIcon,
  Mail,
  FileQuestion,
  Copy,
  Eye,
  EyeOff,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MyContext } from "@/context/MyContext";
import { useToast } from "@/hooks/use-toast"; // Adjust the import path as needed

const plans = [
  {
    name: "Basic",
    monthly: 0,
    annually: 0,
    description: "Ideal for individuals and small businesses.",
    features: ["Basic support", "Limited access", "Essential tools"],
  },
  {
    name: "Super",
    monthly: 199,
    annually: 199,
    description: "Perfect for growing businesses and startups.",
    features: ["Priority support", "Extended access", "Advanced analytics"],
  },
  {
    name: "Advance",
    monthly: 399,
    annually: 399,
    description: "Best for enterprises requiring robust solutions.",
    features: ["24/7 support", "Full access", "Custom integrations"],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setSelectedChat, selectedChat, setUser, setMessages } =
    useContext(MyContext);
  const { toast } = useToast();

  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [billPlan, setBillPlan] = useState("monthly");
  const isMonthly = billPlan === "monthly";
  const [apiKeys, setApiKeys] = useState([]);
  // Track which keys are visible (unmasked)
  const [visibleKeys, setVisibleKeys] = useState({});

  // Fetch API keys for the current user.
  const fetchApiKeys = async () => {
    console.log("Fetching API keys for user:", user?.userId || user?._id);
    try {
      if (!(user?.userId || user?._id)) return;
      const id = user.userId || user._id;
      const res = await axios.get(`/api/api-keys?userId=${id}`);
      console.log("Fetched API keys:", res.data.apiKeys);
      setApiKeys(res.data.apiKeys);

      // Reset visible states for keys
      const visibility = {};
      res.data.apiKeys.forEach((k) => (visibility[k.key] = false));
      setVisibleKeys(visibility);
    } catch (error) {
      console.error("Failed to fetch API keys", error);
    }
  };

  useEffect(() => {
    if (showSettings && (user?.userId || user?._id)) {
      fetchApiKeys();
    }
  }, [showSettings, user]);

  const handleNewsletterSubscribe = () => {
    toast({
      title: "Subscribed",
      description: "You've subscribed to the newsletter!",
    });
    setUser({ ...user, newsletterSubscribed: true });
  };

  const handleNewsletterOptOut = () => {
    toast({
      title: "Opted Out",
      description: "You've opted out of the newsletter.",
    });
    setUser({ ...user, newsletterSubscribed: false });
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.clear();
    }
    router.push("/login");
    setUser(null);
    setMessages([]);
    setSelectedChat(null);
  };

  const handleBuyNow = async (plan) => {
    setIsProcessing(true);
    setCouponMessage("");
    try {
      const response = await axios.post("/api/cashfree/initiate", {
        plan,
        coupon,
        userId: user?._id,
      });
      const { payment_link, message } = response.data;
      if (payment_link) {
        window.location.href = payment_link;
      } else {
        setCouponMessage(
          message || "Payment processed. Your plan has been updated."
        );
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
      setCouponMessage(
        error.response?.data?.error ||
          "Payment initiation failed. Please try again."
      );
    }
    setIsProcessing(false);
  };

  // API key management functions with toast notifications.
  const generateApiKey = async () => {
    console.log("Attempting to generate API key");
    try {
      const id = user?.userId || user?._id;
      if (!id) {
        console.error("User ID not found");
        toast({
          title: "Error",
          description: "User ID not found",
          variant: "destructive",
        });
        return;
      }
      // If on basic plan, enforce maximum of 3 active API keys.
      if (user.plan === "basic") {
        const activeCount = apiKeys.filter((k) => k.active).length;
        if (activeCount >= 3) {
          toast({
            title: "Limit Reached",
            description:
              "Maximum API keys reached for basic plan. Upgrade your plan for more.",
            variant: "destructive",
          });
          return;
        }
      }
      const res = await axios.post("/api/api-keys", {
        userId: id,
        action: "generate",
      });
      if (res.data.error) {
        toast({
          title: "Error",
          description: res.data.error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "API Key generated!" });
      }
      fetchApiKeys();
    } catch (error) {
      console.error("Error generating API key", error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    }
  };

  const regenerateApiKey = async () => {
    console.log("Attempting to regenerate API key");
    try {
      const id = user?.userId || user?._id;
      if (!id) {
        console.error("User ID not found");
        toast({
          title: "Error",
          description: "User ID not found",
          variant: "destructive",
        });
        return;
      }
      const res = await axios.post("/api/api-keys", {
        userId: id,
        action: "regenerate",
      });
      if (res.data.error) {
        toast({
          title: "Error",
          description: res.data.error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "API Key regenerated!" });
      }
      fetchApiKeys();
    } catch (error) {
      console.error("Error regenerating API key", error);
      toast({
        title: "Error",
        description: "Failed to regenerate API key",
        variant: "destructive",
      });
    }
  };

  const deactivateApiKey = async (key) => {
    console.log("Attempting to deactivate API key:", key);
    try {
      const id = user?.userId || user?._id;
      if (!id) return;
      const res = await axios.delete(`/api/api-keys?userId=${id}&key=${key}`);
      if (res.data.error) {
        toast({
          title: "Error",
          description: res.data.error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "API Key deactivated" });
      }
      fetchApiKeys();
    } catch (error) {
      console.error("Error deactivating API key", error);
      toast({
        title: "Error",
        description: "Failed to deactivate API key",
        variant: "destructive",
      });
    }
  };

  // Toggle visibility (show/hide) for a given API key.
  const toggleVisibility = (key) => {
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied", description: "API Key copied to clipboard!" });
  };

  const navItems = [
    {
      icon: MessageSquarePlus,
      label: "Start new chat",
      onClick: () => {
        router.push("/");
        setSelectedChat(null);
      },
      isActive: pathname === "/" && !selectedChat,
    },
    {
      icon: Code,
      label: "Developer API",
      onClick: () => router.push("/apidocs"),
      isActive: pathname === "/apidocs",
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => setShowSettings(true),
      isActive: pathname === "/settings",
    },
    {
      icon: HelpCircle,
      label: "Updates",
      onClick: () => setShowHelp(true),
      isActive: pathname === "/updates",
    },
    {
      icon: FileQuestion,
      label: "FAQs",
      onClick: () => router.push("/faq"),
      isActive: pathname === "/faq",
    },
    ...(!user?.newsletterSubscribed
      ? [
          {
            icon: Mail,
            label: "Subscribe to Newsletter",
            onClick: handleNewsletterSubscribe,
            isActive: false,
          },
        ]
      : []),
  ];

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
          onClick={() => router.push("/")}
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
              item.isActive && "bg-accent text-blue-600"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
        <Link
          href="/dashboard"
          className="flex w-full items-center gap-2 rounded-lg px-0 py-2 text-[15px] font-medium transition-colors hover:bg-accent m-3"
        >
          <LayoutDashboardIcon className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Premium Section */}
      <div className="px-4 mt-auto">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#0A2540] to-[#144676] p-4 text-white">
            <h3 className="font-semibold">
              {user?.plan
                ? "Your Current Plan: " +
                  user.plan.charAt(0).toUpperCase() +
                  user.plan.slice(1)
                : "Upgrade Your Plan"}
            </h3>
            <p className="text-xs text-white/80">
              {user?.plan === "basic"
                ? "You are on the free Basic plan."
                : "Enjoy premium features with your plan."}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <Button
                size="sm"
                className="h-7 bg-white text-[#0A2540] hover:bg-white/90"
                onClick={() => setShowPlanDialog(true)}
              >
                {user?.plan === "basic" ? "Upgrade" : "Change Plan"}
              </Button>
            </div>
          </div>
        </Card>

        {/* User Profile & Logout */}
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
        {/* Only one vertical scrollbar for the entire dialog */}
        <DialogContent className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* API Key Management Card */}
            <Card className="p-4 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">API Key Management</h3>
              <div className="flex gap-4 mb-4">
                <Button variant="outline" onClick={generateApiKey}>
                  Generate API Key
                </Button>
                <Button variant="outline" onClick={regenerateApiKey}>
                  Regenerate API Key
                </Button>
              </div>

              {/* API Keys Table (no overflow-x-auto, so only one scrollbar overall) */}
              <table className="w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys && apiKeys.length > 0 ? (
                    apiKeys.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">
                              {visibleKeys[item.key]
                                ? item.key
                                : "••••••••••••••••••••"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleVisibility(item.key)}
                              title={visibleKeys[item.key] ? "Hide" : "Show"}
                            >
                              {visibleKeys[item.key] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            {visibleKeys[item.key] && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(item.key)}
                                title="Copy"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.expires
                            ? new Date(item.expires).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {item.active ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {item.active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deactivateApiKey(item.key)}
                            >
                              Deactivate
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center"
                      >
                        No API Keys generated.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>

            {/* Other Settings */}
            <div className="space-y-4">
              <Card className="p-4 shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Notifications</h3>
                <Button variant="outline">Manage Notifications</Button>
              </Card>

              <Card className="p-4 shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Other Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Additional settings can be added here.
                </p>
              </Card>

              {user?.newsletterSubscribed && (
                <Card className="p-4 shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">
                    Newsletter Subscription
                  </h3>
                  <Button variant="outline" onClick={handleNewsletterOptOut}>
                    Opt Out
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Updates</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Latest Updates</h3>
            <p className="text-sm text-muted-foreground">
              Version 2.0 is now available with improved AI capabilities.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Plans Modal */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-4xl w-full mx-auto overflow-y-auto max-h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Select a Premium Plan
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4 px-4">
            <label
              htmlFor="coupon"
              className="block text-sm font-medium text-gray-700"
            >
              Coupon Code
            </label>
            <input
              type="text"
              id="coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter coupon code"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {couponMessage && (
              <p
                className={`mt-2 text-sm ${
                  couponMessage.toLowerCase().includes("invalid") ||
                  couponMessage.toLowerCase().includes("error")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {couponMessage}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-3">
            {plans.map((plan) => {
              const price = isMonthly ? plan.monthly : plan.annually;
              const isActive =
                user?.plan?.toLowerCase() === plan.name.toLowerCase();
              return (
                <div
                  key={plan.name}
                  className="flex flex-col p-6 border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="text-4xl font-semibold text-indigo-600">
                    {price === 0 ? "Free" : `₹${price}`}
                    <span className="ml-1 text-lg font-normal text-gray-500">
                      {price === 0 ? "" : `/${isMonthly ? "month" : "year"}`}
                    </span>
                  </div>
                  <div className="mt-2 border-b pb-4">
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {plan.description}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-2 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 106.293 10.707l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    {isActive ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleBuyNow(plan.name.toLowerCase())}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : `Get ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
