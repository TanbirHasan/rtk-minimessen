import { useSelector } from "react-redux";





export default function ChatHead(message) {
    const { sender, receiver } = message || {}
    const { user } = useSelector(state => state.auth) || {}
    const { email } = user || {}

    const partnerEmail = sender?.email === email ? receiver?.email : sender?.email
    const partnerName = sender?.email === email ? receiver?.name : sender?.name
    return (
        <div className="relative flex items-center p-3 border-b border-gray-300">
            <img
                className="object-cover w-10 h-10 rounded-full"
                src="https://media.licdn.com/dms/image/C4E03AQEEZUPHzQoE0A/profile-displayphoto-shrink_400_400/0/1623677348445?e=2147483647&v=beta&t=4yBsLbVOvjpli7F64hdqdgYCNg6KkkCwqV8WIHW-YZA"
                alt={partnerName}
            />
            <span className="block ml-2 font-bold text-gray-600">{partnerName}</span>
        </div>
    );
}
