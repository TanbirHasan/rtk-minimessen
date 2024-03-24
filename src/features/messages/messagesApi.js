import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";

export const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (id) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch,getState }
      ) {
        console.log('state',getState())
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
          const res = await cacheDataLoaded;
          console.log("cache data loaded", res);
          socket.on("message", (data) => {
            console.log("messageData", data?.data);
            updateCachedData((draft) => {
              const draftConversation = draft.find((c) => {
                const innerObj = { ...c };
                console.log("innerOBj", innerObj);
                console.log(
                  "checking matching id",
                  innerObj.conversationId == arg
                );
                return innerObj.conversationId == data?.data?.conversationId;
              });

              if (draftConversation) {
       
                let newDraft = [{
                  conversationId : arg || data?.data?.conversationId,
                  sender: data?.data?.sender,
                  receiver: data?.data?.receiver,
                  message: data?.data.message,
                  timestamp: data?.data.timestamp,
                }]
                // draft.push({
                //   conversationId : arg || data?.data?.conversationId,
                //   sender: data?.data?.sender,
                //   receiver: data?.data?.receiver,
                //   message: data?.data.message,
                //   timestamp: data?.data.timestamp,
                // });
                return [...draft,...newDraft]

              }
            });
          });
        } catch (err) {
          console.error("Error in cacheDataLoaded:", err);
          await cacheEntryRemoved;
          socket.close();
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
