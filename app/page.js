import Carousel from "@/components/Carousal";
import ChatBot from "@/components/ChatBot";
import ChatList from "@/components/ChatList";

export default function Home() {
  return (
    <div className=" flex gap-4 justify-center items-start">
      <ChatList />
      <ChatBot />
    </div>
  );
}
