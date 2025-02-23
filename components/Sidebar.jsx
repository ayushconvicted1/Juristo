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
  LayoutDashboardIcon,
  Mail,
  FileQuestion,
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
import { MyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useContext, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
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
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // State for billing type (monthly vs annually)
  const [billPlan, setBillPlan] = useState("monthly");
  const isMonthly = billPlan === "monthly";

  // Pricing plans (updated pricing):
  // Basic: Free, Super: ₹199/month, Advance: ₹399/month
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

  // Newsletter subscription handlers
  const handleNewsletterSubscribe = () => {
    alert("Subscribed to newsletter!");
    // Update user state to reflect subscription
    setUser({ ...user, newsletterSubscribed: true });
  };

  const handleNewsletterOptOut = () => {
    alert("You've opted out of the newsletter.");
    // Update user state to reflect opt out
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
    setCouponMessage(""); // clear any previous messages
    try {
      const response = await axios.post("/api/cashfree/initiate", {
        plan,
        coupon,
        userId: user?._id,
      });
      const { payment_link, message } = response.data;
      if (payment_link) {
        // Redirect to payment if Cashfree provides a payment link.
        window.location.href = payment_link;
      } else {
        // If no payment link but a message is returned, show it as a success message.
        setCouponMessage(
          message || "Payment processed. Your plan has been updated."
        );
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
      // Display backend error (or fallback error message)
      setCouponMessage(
        error.response?.data?.error ||
          "Payment initiation failed. Please try again."
      );
    }
    setIsProcessing(false);
  };

  // API key management functions
  const generateApiKey = () => {
    // Implement your API key generation logic here
    alert("API Key generated!");
  };

  const regenerateApiKey = () => {
    // Implement your API key regeneration logic here
    alert("API Key regenerated!");
  };

  // Navigation items array. Conditionally add the newsletter subscription tab
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
    // Only show the newsletter subscription tab if the user hasn't subscribed
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
            <p></p>
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
            {/* Conditionally render API key management if the user's plan is "super" or "premium" */}
            {(user?.plan === "super" || user?.plan === "premium") && (
              <div className="grid gap-2">
                <h3 className="font-medium">API Key Management</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={generateApiKey}>
                    Generate API Key
                  </Button>
                  <Button variant="outline" onClick={regenerateApiKey}>
                    Regenerate API Key
                  </Button>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <h3 className="font-medium">Notifications</h3>
              <Button variant="outline">Manage Notifications</Button>
            </div>
            <div className="grid gap-2">
              <h3 className="font-medium">Other Settings</h3>
              <p className="text-sm text-muted-foreground">
                Additional settings can be added here.
              </p>
            </div>
            {/* If user is subscribed to the newsletter, show option to opt out */}
            {user?.newsletterSubscribed && (
              <div className="grid gap-2">
                <h3 className="font-medium">Newsletter Subscription</h3>
                <Button variant="outline" onClick={handleNewsletterOptOut}>
                  Opt Out
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Updates</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Latest Updates</h3>
              <p className="text-sm text-muted-foreground">
                Version 2.0 is now available with improved AI capabilities
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Plans Modal */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-4xl w-full mx-auto overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select a Premium Plan</DialogTitle>
          </DialogHeader>

          {/* Coupon Input Field with Message */}
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

          {/* Pricing Cards Container */}
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
                  {/* Price */}
                  <div className="text-4xl font-semibold text-indigo-600">
                    {price === 0 ? "Free" : `₹${price}`}
                    <span className="ml-1 text-lg font-normal text-gray-500">
                      {price === 0 ? "" : `/${isMonthly ? "month" : "year"}`}
                    </span>
                  </div>

                  {/* Plan Name & Description */}
                  <div className="mt-2 border-b pb-4">
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
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

                  {/* Buy Now / Current Button */}
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
