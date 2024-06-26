import { useEffect, useState } from "react";
import isvalidateEmail from "../../utils/isValidEmail";
import { useGetUserQuery } from "../../features/users/usersApi";
import { useDispatch, useSelector } from "react-redux";
import {
  conversationApi,
  useAddConversationMutation,
  useEditConversationMutation,
} from "../../features/coversations/coversationsApi";

export default function Modal({ open, control }) {
  const [to, setTo] = useState("");
  const [skipOff, setSkipOff] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [conversation, setConversation] = useState(undefined);
  const [message, setMessage] = useState("");
  const { user: loggedInUser } = useSelector((state) => state.auth || {});
  const { email } = loggedInUser || {};
  const dispatch = useDispatch();

  const {
    data: participant,
    isLoading,
    isError,
  } = useGetUserQuery(to, {
    skip: !skipOff,
  });

  const [
    addConversation,
    { isSuccess: isPostSuccess, isLoading: postLoading, isError: postError },
  ] = useAddConversationMutation();
  const [editConversation, { isSuccess: isEditSuccess }] =
    useEditConversationMutation();

  useEffect(() => {
    if (
      to &&
      participant !== undefined &&
      participant?.length > 0 &&
      participant[0]?.email !== email
    ) {
      console.log("participantemail", to);
      // check conversation existence for rendring the conversation
      dispatch(
        conversationApi.endpoints.getConversation.initiate({
          userEmail: email,
          participantEmail: to,
        })
      )
        .unwrap()
        .then((data) => setConversation(data[0]))
        .catch((err) => setResponseError("There was an error"));
    }
  }, [participant, dispatch, email, to]);

  const debounceHandler = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const doSearch = (value) => {
    if (isvalidateEmail(value)) {
      setSkipOff(true);
      setTo(value);
    }
  };

  console.log("Message", message, conversation);

  const handleSearch = debounceHandler(doSearch, 500);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (conversation) {
      editConversation({
        id: conversation?.id,
        sender: email,
        data: {
          participants: `${email}-${participant[0].email}`,
          users: [loggedInUser, participant[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    } else {
      addConversation({
        sender: email,
        data: {
          participants: `${email}-${participant[0].email}`,
          users: [loggedInUser, participant[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    }
  };

  useEffect(() => {
    if (isPostSuccess || isEditSuccess) {
      control();
    }
  }, [isEditSuccess, isPostSuccess]);

  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send message
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  id="to"
                  name="to"
                  type="email"
                  onChange={(e) => handleSearch(e.target.value)}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={
                  
                  (participant?.length > 0 && participant?.[0].email === email)
                }
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Send Message
              </button>
            </div>

            {participant?.length === 0 && (
              <span className="text-red-600 font-semibold">
                This user doesn't exit
              </span>
            )}
            {participant?.length > 0 && participant?.[0].email === email && (
              <span className="text-red-600 font-semibold">
                You can't send message to yourself
              </span>
            )}
            {responseError && (
              <span className="text-red-600 font-semibold">
                {responseError}
              </span>
            )}
            {/* <Error message="There was an error" /> */}
          </form>
        </div>
      </>
    )
  );
}
