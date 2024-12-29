import Carousel from "@/components/Carousal";
import ChatBot from "@/components/ChatBot";
import ChatList from "@/components/ChatList";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex gap-4 justify-center items-start h-screen">
      {/* Sidebar */}
      <div className="flex-none w-1/5 h-full overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main ChatBot Section */}
      <div className="flex-1 h-full relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto">
          <ChatBot />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-none w-1/5 h-full overflow-y-auto">
        <ChatList />
      </div>
    </div>
  );
}
