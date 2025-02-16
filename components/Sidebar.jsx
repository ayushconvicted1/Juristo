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
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      icon: MessageSquare,
      label: "AI chat",
      onClick: () => {
        router.push("/");
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
      isActive: pathname === "/" && selectedChat,
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
      label: "Updates and FAQ",
      onClick: () => setShowHelp(true),
      isActive: false,
    },
  ];

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
    try {
      const response = await axios.post("/api/cashfree/initiate", {
        plan,
        userId: user?._id, // ensure you're passing the user's _id from context
      });
      const { payment_link, message } = response.data;
      if (payment_link) {
        window.location.href = payment_link;
      } else {
        alert(message || "Payment processed. Your plan has been updated.");
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
      alert("Payment initiation failed. Please try again.");
    }
    setIsProcessing(false);
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

      {/* Premium Plans Modal */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        {/* Limit width and height to avoid overflow */}
        <DialogContent className="max-w-4xl w-full mx-auto overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select a Premium Plan</DialogTitle>
          </DialogHeader>

          {/* Cards Container */}
          <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-3">
            {plans.map((plan) => {
              const price = isMonthly ? plan.monthly : plan.annually;
              // Disable the button if the user's active plan matches this plan.
              const isActive =
                user?.plan?.toLowerCase() === plan.name.toLowerCase();
              return (
                <div
                  key={plan.name}
                  className="flex flex-col p-6 border border-gray-200 rounded-lg shadow-sm bg-white"
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
