import img from '@/assets/chatapp-image.jpg';
import { EllipsisVertical, SendHorizontal, Smile } from 'lucide-react';
import { Input } from '../ui/input';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useEffect, useRef, useState } from 'react';
import type { Message } from '@/type/message';
import { getChats } from '@/service/messages';
import { socket } from '@/socket/socket';
import { extractTime12Hour, getDateLabel } from '@/utils/extractTime';
import { incrementUnreadCount, setMessages } from '@/store/user/userSlice';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import audio_mp3 from '@/assets/whatsapp_pc.mp3';

const Chat = () => {

    // Redux State
    const { user, selectedUser, conversationId, selectedUserMessages } = useSelector((state: RootState) => state.user);

    // Component State
    const [inputMessage, setInputMessage] = useState("");
    const [loadOlderMessages, setLoadOlderMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [openEmoji, setOpenEmoji] = useState(false);

    // ref elements
    const chatDivRef = useRef<HTMLDivElement>(null);
    const scrollDiv = useRef<HTMLDivElement>(null);
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch();


    // Handle User Input Message state
    const handleInputMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);
    }

    useEffect(() => {
        // Handle mouse click event to close emoji window
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (emojiRef.current && !emojiRef.current.contains(target)) {
                setOpenEmoji(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        // Show recieved message through socket io
        socket.on("recieve-message", (message) => {
            if (!selectedUser || !conversationId) return;
            if (message.conversationId !== conversationId) {
                const audio = new Audio(audio_mp3);
                audio.play();
                dispatch(incrementUnreadCount(message.conversationId));
            } else {
                dispatch(setMessages({ userId: selectedUser?._id, messages: [...selectedUserMessages[selectedUser?._id], message] }))
            }
        })
        return () => {
            socket.off("recieve-message")
            document.removeEventListener("mousedown", handleClickOutside);
        }
    })

    // Method to send message
    const sendMessage = async () => {
        if (!inputMessage || !user || !selectedUser) return;
        const message: Message = {
            _id: Date.now().toString(),
            senderId: user?._id,
            recieverId: selectedUser._id,
            content: inputMessage,
            createdAt: new Date(Date.now()).toString(),
            type: "text"
        }
        dispatch(setMessages({ userId: message.recieverId, messages: [...selectedUserMessages[selectedUser._id], message] }));
        socket.emit("message", message);
        setInputMessage("")
    }

    // Event to send message on press enter
    const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputMessage !== "") {
            sendMessage()
            setInputMessage("");
        }
    }

    // Handle Emoji 
    const handleEmoji = (e: EmojiClickData) => {
        setInputMessage(inputMessage + e.emoji)
        setOpenEmoji(false);
    }

    // Fetch Older messages when use scroll to top
    const handleScroll = async () => {
        if (!chatDivRef) return;
        const container = chatDivRef.current;
        if (loadOlderMessages || !hasMoreMessages) return;
        if (container?.scrollTop === 0 && conversationId && selectedUser) {
            const messages = selectedUserMessages[selectedUser?._id]
            setLoadOlderMessages(true);
            console.log("Scroll to top");
            const response = await getChats(conversationId, messages[0].createdAt);
            dispatch(setMessages({ userId: selectedUser._id, messages: [...response.messages, ...selectedUserMessages[selectedUser._id]] }));
            setHasMoreMessages(response.hasMore);
            setLoadOlderMessages(false);
        }
    }

    return (
        selectedUser ? <div className="flex flex-col w-full h-screen">
            <div className="h-14 bg-[#95CCDD] flex justify-between p-4 items-center">
                <div className='flex gap-2 items-center'>
                    <img src={img} alt="profile image" className='object-cover h-10 w-10 rounded-full' />
                    <div className='flex flex-col'>
                        <span className='text-sm'>{selectedUser.name}</span>
                        <span className='text-[10px] text-gray-500'>Offline</span>
                    </div>

                </div>
                <div>
                    <EllipsisVertical className='cursor-pointer' />
                </div>
            </div>
            <div ref={chatDivRef} className='flex-1 overflow-y-auto no-scrollbar' onScroll={handleScroll}>
                <div className='min-h-full flex flex-col justify-end p-4 gap-3'>
                    {loadOlderMessages &&
                        <div className="flex justify-center items-center">
                            <div className="h-7 w-7 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                        </div>}

                    {selectedUserMessages[selectedUser._id]?.map((message, i) => {
                        const getDate = getDateLabel(new Date(message.createdAt));
                        const isSame = (i !== 0 && getDateLabel(new Date(selectedUserMessages[selectedUser?._id][i - 1].createdAt)) === getDate);
                        return (
                            <div key={message._id}>
                                {(i === 0 || !isSame) && <p className='text-center'>{getDate}</p>}
                                <div className={`flex ${message.senderId === user?._id ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex items-center h-10 gap-2 px-2 ${message.senderId === user?._id ? "bg-[#25D366]" : "bg-[#34B7F1]"} rounded-md  max-w-[70%]`}>

                                        <p key={message._id} className=''>{message.content}</p>
                                        <span className={`text-[10px] self-baseline-last ${message.senderId === user?._id ? "right-2" : "left-2"} text-gray-700`}>{extractTime12Hour(message.createdAt)}</span>
                                    </div>
                                </div>

                            </div>
                        )

                    })}
                    <div ref={scrollDiv}></div>
                </div>

            </div>
            <div className="h-15 bg-[#95CCDD] flex items-center justify-center gap-2">
                <Input onKeyDown={handleEnterPress} value={inputMessage} placeholder='Type message here' className='h-10 w-[70%]' onChange={handleInputMessage} />
                <div className="absolute right-1.5 bottom-14" ref={emojiRef}>
                    <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
                </div>
                <SendHorizontal className={`h-7 w-7 cursor-pointer ${inputMessage.trim() === "" ? "cursor-not-allowed opacity-20" : "cursor-pointer text-blue-600"}`} onClick={sendMessage} />
                <Smile className='h-7 w-7 cursor-pointer' onClick={() => setOpenEmoji(!openEmoji)} />
            </div>
        </div > : <div className='w-full flex justify-center items-center'><p className='bg-gray-300 p-3 rounded-md font-semibold'>Select a user to chat</p></div>
    )
}

export default Chat