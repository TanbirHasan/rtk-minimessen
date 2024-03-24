import { useDispatch, useSelector } from "react-redux";
import { conversationApi, useGetConversationsQuery } from "../../features/coversations/coversationsApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { apiSlice } from "../../features/api/apiSlice";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth) || {};
  const [page,setPage] = useState(0);
  const [hasMore,setHasMore] = useState(true);
  const dispatch = useDispatch();


  const fetchMore = () => {
    setPage(prev => prev+1)
  }


  const { email } = user || {};

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetConversationsQuery(email) || {};


  const {data:conversation,totalCount} = data || {}


  useEffect(() => {
    if(page > 1){
      dispatch(conversationApi.endpoints.getMoreConversations.initiate({email,page}))
    }
  },[page,email,dispatch])

  useEffect(() => {
    if(totalCount > 0){
      const more = Math.ceil(totalCount / Number(process.env.REACT_APP_CONVERSATION_PER_PAGE)) > page;
      setHasMore(more)
    }

  },[totalCount,page])



  // decide what to render
  let content = null;
  if (isLoading) {
    content = <li className="m-2 text-center">loading</li>;
  } else if (!isLoading && isError) {
    content = <Error message={error.data} />;
  } else if (!isLoading && !isError && conversation?.length === 0) {
    content = <li className="m-2 text-center">No conversation found</li>;
  } else if (!isLoading && !isError && conversation?.length > 0) {
    content = (
      <InfiniteScroll
        dataLength={conversation?.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        height={window.innerHeight - 129}
      >
        {conversation.map((conversation) => {
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
        })}
      </InfiniteScroll>
    );
  }
  return <ul>{content}</ul>;
}
