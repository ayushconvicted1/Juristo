import ChatBoxForDocs from "@/components/ChatBotForImage";
import DocsChatList from "@/components/DocsChatList";

export default function Home() {
  return (
    <div className=" flex gap-4 justify-center items-start">
      <DocsChatList />
      <ChatBoxForDocs />
    </div>
  );
}
