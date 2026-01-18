import { useChatStore } from "../store/useChatStore";
import Animated from "../Components/Animated";
import ProfileHeader from "../Components/ProfileHeader";
import ActiveTabSwitch from "../Components/ActiveTabSwitch";
import ChatsList from "../Components/ChatsList";
import ContactList from "../Components/ContactList";
import ChatContainer from "../Components/ChatContainer";
import NoConversationPlaceholder from "../Components/NoConversationPlaceholder";

function ChatPage() {

       const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="z-20">
      <div className="relative w-full min-w-6xl h-[680px]">
      <Animated>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </Animated>
    </div>
    </div>
  )
}

export default ChatPage
