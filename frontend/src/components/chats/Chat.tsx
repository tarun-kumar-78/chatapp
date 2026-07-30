import img from '@/assets/avatar.avif';
import { ArrowLeft, ChevronDown, EllipsisVertical, Image, SendHorizontal, Smile, ThumbsDown, Trash2, X } from 'lucide-react';
import { Input } from '../ui/input';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import React, { useEffect, useRef, useState } from 'react';
import type { Message } from '@/type/message';
import { getChats } from '@/service/messages';
import { socket } from '@/socket/socket';
import { extractTime12Hour, getDateLabel } from '@/utils/extractTime';
import { incrementUnreadCount, setMessages, setSelectedUser } from '@/store/user/userSlice';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
// import audio_mp3 from '@/assets/whatsapp_pc.mp3';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import api from '@/service/axios';
import { Checkbox } from '../ui/checkbox';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { getErrMessage } from '@/utils/getErrMessage';

const Chat = () => {

    // Redux State
    const { user, selectedUser, conversationId, selectedUserMessages } = useSelector((state: RootState) => state.user);

    // Component State
    const [inputMessage, setInputMessage] = useState("");
    const [loadOlderMessages, setLoadOlderMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [openEmoji, setOpenEmoji] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [openMenuId, setOpenMenuId] = useState("");
    const [showCheckBox, setShowCheckbox] = useState(false);
    const [deleteMessages, setDeleteMessages] = useState<string[]>([]);
    const [isDeleteMessage, setIsDeleteMessage] = useState(false);

    // ref elements
    const chatDivRef = useRef<HTMLDivElement>(null);
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = useRef(true);
    const dispatch = useDispatch();
    const imgUploadRef = useRef<HTMLInputElement | null>(null);


    // Handle User Input Message state
    const handleInputMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);
        scrollToBottom.current = true;
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

        // socket event to check user is online or not
        socket.on("online", (usersList) => {
            setOnlineUsers(usersList);
        })

        // Show recieved message through socket io
        socket.on("recieve-message", (message) => {
            if (!selectedUser || message.conversationId !== conversationId) {
                // const audio = new Audio(audio_mp3);
                // audio.play();
                // setBlueTick("delivered");
                dispatch(incrementUnreadCount(message.conversationId));
            } else {
                if (!selectedUser) return;
                dispatch(setMessages(
                    {
                        userMessages:
                        {
                            [selectedUser._id]: {
                                messages: [...selectedUserMessages.userMessages[selectedUser._id].messages, message],
                                loading: false
                            }
                        }
                    }))
                // setBlueTick("read");
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
        dispatch(setMessages({
            userMessages: {
                [selectedUser._id]: { messages: [...selectedUserMessages.userMessages[selectedUser._id].messages, message], loading: false }
            }
        }));
        socket.emit("message", message);
        setInputMessage("")
    }

    // Event to send message on enter press
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
            const messages = selectedUserMessages.userMessages[selectedUser._id].messages ?? [];
            setLoadOlderMessages(true);
            const response = await getChats(conversationId, messages.length > 1 ? messages[0].createdAt : "");
            dispatch(setMessages(
                {
                    userMessages: {
                        [selectedUser._id]: { messages: [...response.messages, ...selectedUserMessages.userMessages[selectedUser._id].messages], loading: false }
                    }
                }
            ));
            setHasMoreMessages(response.hasMore);
            setLoadOlderMessages(false);
            scrollToBottom.current = false;
        }
    }

    useEffect(() => {
        if (!scrollToBottom.current || !chatDivRef) return;
        chatDivRef.current?.scrollTo({
            top: chatDivRef.current.scrollHeight,
            behavior: "smooth"
        })
    }, [selectedUserMessages, inputMessage]);

    // send image method
    const sendImage = async (formData: FormData) => {
        console.log(formData.values());
        const response = await api.post('/api/message/share-image', formData);
        console.log(response.data);
        return response.data.imageUrl;
    }

    // Handle Image Upload 
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedUser && user) {
            const imgUrl = URL.createObjectURL(file);
            const message = {
                _id: Date.now().toString(),
                senderId: user?._id,
                recieverId: selectedUser._id,
                content: imgUrl,
                type: "image",
                createdAt: new Date(Date.now()).toString(),
            }
            dispatch(setMessages(
                {
                    userMessages: {
                        [selectedUser._id]: {
                            messages: [...selectedUserMessages.userMessages[selectedUser._id].messages, message],
                            loading: false,
                        }
                    }
                }
            ))
            const formData = new FormData();
            formData.append("image", file);
            formData.append("senderId", user._id);
            formData.append("receiverId", selectedUser._id);
            const imageUrl = await sendImage(formData);
            socket.emit("message", { ...message, content: imageUrl });
        }
    }

    // Method to handle delete messages
    const handleDeleteMessages = (messagesId: string) => {
        if (deleteMessages.includes(messagesId)) {
            setDeleteMessages(deleteMessages.filter((id) => id !== messagesId));
        } else {
            setDeleteMessages(messagesIds => [...messagesIds, messagesId]);
        }
    }

    // Api for deleting user selected messages
    const deleteMessagesMethod = async () => {
        try {
            const response = await api.put("/api/message/delete-messages", deleteMessages);
            toast.success(response.data.messages);
            if (selectedUser && conversationId) {
                const res = await getChats(conversationId, "");
                dispatch(setMessages({ userMessages: { [selectedUser._id]: { messages: res.messages, loading: false } } }));
            }
            setShowCheckbox(false);
            setDeleteMessages([]);
        } catch (err) {
            const msg = getErrMessage(err);
            toast.error(msg);
            console.error(err);
        }

    }


    return (
        <>
            {selectedUser ? <div className="relative flex flex-col w-full h-screen">
                <div className="h-14 bg-gray-300 flex justify-between p-4 items-center">
                    <div className='flex gap-2 items-center'>
                        <ArrowLeft className='lg:hidden' onClick={() => dispatch(setSelectedUser(null))} />
                        <img src={img} alt="profile image" className='object-cover h-10 w-10 rounded-full' />
                        <div className='flex flex-col'>
                            <span className='text-sm'>{selectedUser.name}</span>
                            <span className='text-[10px] text-gray-600'>{`${onlineUsers.includes(selectedUser._id) ? "Online" : `Last Seen ${extractTime12Hour(selectedUser.lastSeenAt)}`} `}</span>
                        </div>

                    </div>

                    <div>
                        {/* // DropDown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <EllipsisVertical className='cursor-pointer' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className=''>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Block</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>


                <div ref={chatDivRef} className='flex-1 overflow-y-auto no-scrollbar p-2' onScroll={handleScroll}>
                    <div className={`min-h-full flex flex-col justify-end ${showCheckBox ? "transition-all ease-in-out duration-300 p-3" : "p-0"} gap-3`}>

                        {loadOlderMessages &&
                            <div className="flex justify-center items-center">
                                <div className="h-7 w-7 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                            </div>}
                        {selectedUserMessages.userMessages[selectedUser._id]?.loading ?? true ? [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2].map((mess, i) => {
                            return (
                                <SkeletonTheme key={i} baseColor="#e7e1e1" highlightColor="#bcb7b7">
                                    <div className={`flex ${mess % 2 == 0 ? "justify-end" : "justify-start"}`}>
                                        <Skeleton width={180} height={40} />
                                    </div>
                                </SkeletonTheme>


                            )
                        }) :
                            selectedUserMessages.userMessages[selectedUser._id]?.messages?.map((message, i) => {
                                const getDate = getDateLabel(new Date(message.createdAt));
                                const isSame = (i !== 0 && getDateLabel(new Date(selectedUserMessages.userMessages[selectedUser?._id].messages[i - 1].createdAt)) === getDate);
                                return (
                                    <div key={message._id}>
                                        {(i === 0 || !isSame) && <p className='text-center my-4 text-sm max-sm:text-[.78rem]'>{getDate}</p>}
                                        <div className='flex items-center'>
                                            <Checkbox className={`${showCheckBox ? "transition-all duration-300 -translate-x-2" : "transition-all -translate-x-8 duration-300 ease-in-out"}`} onClick={() => handleDeleteMessages(message._id)} checked={deleteMessages.includes(message._id)} />
                                            <div className={`flex w-full ${message.senderId === user?._id ? "justify-end" : "justify-start"}`}>

                                                {!selectedUserMessages.userMessages[selectedUser._id]?.loading && message.type === 'text' ? <div className={`group relative flex gap-1 pl-2 ${message.senderId === user?._id ? `bg-[#25D366]` : `bg-[#34B7F1]`} rounded-md max-w-[90%]`}>

                                                    <p key={message._id} className='py-2 w-fit text-sm max-sm:text-[.78rem]'>{message.content}</p>
                                                    <p className={`text-[9px] self-end w-11  ${message.senderId === user?._id ? "right-2" : "left-2"} text-gray-700`}>{extractTime12Hour(message.createdAt)}</p>
                                                    {!showCheckBox && <DropdownMenu open={message._id === openMenuId} onOpenChange={(open) => setOpenMenuId(open ? message._id : "")}>
                                                        <DropdownMenuTrigger>
                                                            <ChevronDown onClick={() => setOpenMenuId(message._id)} className='absolute text-white h-5 w-5 top-1 right-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align='start'>
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem><ThumbsDown />Report</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => { setShowCheckbox(true); setDeleteMessages((messId) => [...messId, message._id]) }}><Trash2 />Delete</DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>}
                                                </div> : <div className={`group rounded-md p-1 relative ${message.senderId === user?._id ? "bg-[#25D366]" : "bg-[#34B7F1]"} `}>
                                                    <img src={message.content} className='rounded-md h-52 ' alt="image" />
                                                    <p className={`text-[9px] absolute bottom-2 text-gray-100 right-2`}>{extractTime12Hour(message.createdAt)}</p>
                                                    <DropdownMenu open={message._id === openMenuId} onOpenChange={(open) => setOpenMenuId(open ? message._id : "")}>
                                                        <DropdownMenuTrigger>
                                                            <ChevronDown onClick={() => setOpenMenuId(message._id)} className='absolute text-white h-5 w-5 top-1 right-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align='start'>
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem><ThumbsDown />Report</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => { setShowCheckbox(true); setDeleteMessages((messId) => [...messId, message._id]) }}><Trash2 />Delete</DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>}

                                            </div>
                                        </div>

                                    </div>

                                )


                            })

                        }


                    </div>
                </div>
                <div className="bg-gray-300 flex items-center w-full p-2">
                    {!showCheckBox ? <div className='flex w-full items-center gap-2'>
                        <Input onKeyDown={handleEnterPress} value={inputMessage} placeholder='Type message here' className='py-2 lg:text-1rem text-.5rem w-full bg-gray-100' onChange={handleInputMessage} />
                        <div className="absolute right-1.5 bottom-16" ref={emojiRef}>
                            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
                        </div>
                        <SendHorizontal className={`h-7 w-7 cursor-pointer ${inputMessage.trim() === "" ? "cursor-not-allowed opacity-20" : "cursor-pointer text-blue-600"}`} onClick={sendMessage} />
                        <Smile className='h-6 w-6 cursor-pointer text-gray-600' onClick={() => setOpenEmoji(!openEmoji)} />
                        <form method="post" encType="multipart/form-data">
                            <input type="file" ref={imgUploadRef} className='hidden' accept='image/*' onChange={handleImageUpload} />
                            <Image onClick={() => imgUploadRef.current?.click()}
                                className={`h-5 w-5 cursor-pointer text-gray-600`}
                            />
                        </form>
                    </div> : <div className='flex justify-between w-full px-5'>
                        <div className='flex gap-3'>
                            <X onClick={() => {
                                setShowCheckbox(false); setDeleteMessages([]);
                            }} className='cursor-pointer' />
                            <p>{deleteMessages.length} selected</p>
                        </div>
                        <Trash2 onClick={() => setIsDeleteMessage(true)} className='h-5 w-5 cursor-pointer' />
                    </div>}



                </div>
            </div > : <div className={`w-full lg:flex justify-center items-center ${!selectedUser ? "hidden" : "flex"} `}><p className='bg-gray-300 p-3 rounded-md font-semibold'>Select a user to chat</p></div>
            }

            <AlertDialog open={isDeleteMessage} onOpenChange={setIsDeleteMessage} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Messages?</AlertDialogTitle>
                        <AlertDialogDescription>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteMessage(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteMessagesMethod}>Delete for me</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>

    )
}

export default Chat