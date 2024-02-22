// import Blank from "./Blank";
import { useParams } from "react-router-dom";
import { userMessagesQuery } from "../../../features/messages/messagesApi";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";
import Error from "../../ui/Error";

export default function ChatBody() {
  const { id } = useParams();

  const { data: messages, isLoading, isError } = userMessagesQuery(id);

  let content;
  if (isLoading) {
    content = <span>Loading...</span>;
  } else if (!isLoading && isError) {
    content = <Error message="There is an error" />;
  } else if (!isLoading && !isError && messages.length === 0) {
    content = <div>No messages found</div>;
  } else if (!isLoading && !isError && messages.length > 0) {
    content = 
      <>
        <ChatHead
          avatar="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
          name="Akash Ahmed"
        />
        <Messages messages={messages}/>
        <Options />
        {/* <Blank /> */}
      </>
    ;
  }
  return (
    <div className="w-full lg:col-span-2 lg:block">
      <div className="w-full grid conversation-row-grid">
        {content}
      </div>
    </div>
  );
}
