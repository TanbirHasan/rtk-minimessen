import { apiSlice } from "../api/apiSlice";


export const conversationApi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({

        getConversations : builder.query({
            query : (email) => `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`
        }),

        getConversation : builder.query({
            query : ({userEmail,partcipantEmail}) => `/conversations?participants_like=${userEmail}-${partcipantEmail}&&participants_like=${partcipantEmail}-${userEmail}`
        }),
        addConversation : builder.mutation({
            query : (data) => ({
                url:'/coversation',
                method : 'POST',
                body : data,
            })
        }),
        editConversation : builder.mutation({
            query : ({id,data}) => ({
                url:`/conversation/${id}`,
                method : 'PATCH',
                body : data,
            })
        })
        
        
    })
})


export const {useGetConversationsQuery,useGetConversationQuery,useAddConversationMutation,useEditConversationMutation} = conversationApi