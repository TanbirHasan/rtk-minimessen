import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";

export const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (id) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, dispatch }
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
          socket.on("message", (data) => {
            console.log("messageData", data);
            updateCachedData((draft) => {
              const draftConversation = draft.find(
                (c) => c.id == data?.data?.id
              );
              console.log("conversation", draftConversation);
              if (draftConversation?.id) {
                // Dispatch the addMessage mutation with the new message data
                dispatch(messageApi.endpoints.addMessage.initiate(
                  {
                    conversationId: data?.data.coversationId,
                    sender: data?.data.sender.email,
                    receiver: data?.data?.revceiver.email,
                    message: data?.data.message,
                    timestamp: data?.data.timestamp,
                  }
                ))
                ;// Dispatching the mutation directly
              }
            });
          });
        } catch (err) {
          console.error("Error in cacheDataLoaded:", err);
        }
      },
    }),
    addMessage: builder.mutation({
      query: (data) => ({
        url: "/messages",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetMessagesQuery, useAddMessagesMutation } = messageApi;
