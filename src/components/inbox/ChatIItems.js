import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/coversations/coversationsApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import { Link } from "react-router-dom";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth) || {};

  const { email } = user || {};

  const {
    data: conversation,
    isLoading,
    isError,
    error,
  } = useGetConversationsQuery(email);

  // decide what to render
  let content = null;
  if (isLoading) {
    content = <li className="m-2 text-center">loading</li>;
  } else if (!isLoading && isError) {
    content = <Error message={error.data} />;
  } else if (!isLoading && !isError && conversation.length === 0) {
    content = <li className="m-2 text-center">No conversation found</li>;
  } else if (!isLoading && !isError && conversation.length > 0) {
    content = conversation.map((conversation) => {
      const { name } = getPartnerInfo(conversation.users, email);
      return (
        <li key={conversation.id}>
          <Link to={`/inbox/${conversation.id}`}>
            <ChatItem
              id={conversation.id}
              avatar="https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg"
              name={name}
              lastMessage={conversation.message}
              lastTime={moment(conversation.timestamp).fromNow()}
            />
          </Link>
        </li>
      );
    });
  }
  return <ul>{content}</ul>;
}
