import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import { messageApi } from "../messages/messagesApi";

export const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`,
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // create socket
        const socket = io("http://localhost:9000", {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        try {
          await cacheDataLoaded;
          socket.on("conversation", (data) => {
            console.log(data);
            updateCachedData((draft) => {
              console.log('draft',draft)
              const draftConversation = draft.find(
                (c) => c.id == data?.data?.id
              );
              console.log('conversation',draftConversation)
              if (draftConversation?.id) {
                draftConversation.message = data?.data.message;
                draftConversation.timestamp = data?.data.timestamp;
              } else {
              }
            });
          });
        } catch (err) {}

        await cacheEntryRemoved;
        socket.close();
      },
    }),

    getConversation: builder.query({
      query: ({ userEmail, participantEmail }) =>
        `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
    }),
    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        const conversation = await queryFulfilled;
        if (conversation?.data.id) {
          // silent entry to message table
          const users = arg.data.users;
          const senderUser = users?.find((user) => user.email === arg.sender);
          const receiverUser = users?.find((user) => user.email !== arg.sender);
          dispatch(
            messageApi.endpoints.addMessage.initiate({
              conversationId: conversation?.data.id,
              sender: senderUser,
              receiver: receiverUser,
              message: arg.data.message,
              timestamp: arg.data.timestamp,
            })
          );
        }
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, sender, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            "getConversations",
            arg.sender,
            (draft) => {
              const draftConversation = draft.find((c) => c.id == arg.id);
              draftConversation.message = arg.data.message;
              draftConversation.timestamp = arg.data.timestamp;
            }
          )
        );

        // optimistic cache update end

        try {
          const conversation = await queryFulfilled;
          if (conversation?.data.id) {
            // silent entry to message table
            const users = arg.data.users;
            const senderUser = users?.find((user) => user.email === arg.sender);
            const receiverUser = users?.find(
              (user) => user.email !== arg.sender
            );
            const res = await dispatch(
              messageApi.endpoints.addMessage.initiate({
                conversationId: conversation?.data.id,
                sender: senderUser,
                receiver: receiverUser,
                message: arg.data.message,
                timestamp: arg.data.timestamp,
              })
            ).unwrap();

            // pesimistic update of messages cache
            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                res.conversationId.toString(),
                (draft) => {
                  draft.push(res);
                }
              )
            );
            // pesimistic update of messages cache end
          }
        } catch (err) {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetSingleConversationQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationApi;
