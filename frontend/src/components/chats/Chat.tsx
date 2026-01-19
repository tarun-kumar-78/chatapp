import { Bell, BellOff, Camera, SendHorizontal, Smile } from "lucide-react"
import img from '@/assets/chatapp-image.jpg';
import { Input } from "../ui/input";
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket/socket";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Message } from "@/type/message";

const Chat = () => {
    const [openEmoji, setOpenEmoji] = useState(false);
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const { user } = useSelector((state: RootState) => state.user);
    const { selectedUser } = useSelector((state: RootState) => state.user);
    const { selectedUserMessages } = useSelector((state: RootState) => state.user);
    const [mute, setMute] = useState(false);
    const handleEmoji = (e: EmojiClickData) => {
        setMessage(message + e.emoji);
        setOpenEmoji(false);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) return;

            if (emojiRef.current && !emojiRef.current.contains(target)) {
                setOpenEmoji(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        socket.on("recieve-message", (message) => {
            setMessages((prev) => {
                const updated = [...prev, message];
                return updated;
            });
        });
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            socket.off("recieve-message");
        };
    }, []);



    const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

    const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter")
            sendMessage();
    }

    const sendMessage = () => {
        if (!selectedUser || !user) return;
        const msg: Message = {
            id: Date.now().toString(),
            senderId: user._id,
            recieverId: selectedUser?._id,
            text: message,
            timestamp: new Date().toString(),
        }
        setMessages((prev) => [...prev, msg]);
        socket.emit("message", msg);
        setMessage("");
    }

    return (
        <div className="border w-full md:flex-1 hidden md:flex flex-col relative">
            {selectedUser ?
                <>
                    <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-3">
                            <img src={img} alt="profile image" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
                            <div>
                                <p className="text-sm font-medium">{selectedUser?.name}</p>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </div>
                        <div>
                            {mute ? <BellOff onClick={() => setMute(false)} className="h-5 w-5 cursor-pointer" /> : <Bell className="h-5 w-5 cursor-pointer" onClick={() => setMute(true)} />}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 justify-end py-2 px-3">
                        {messages?.map((message: Message) => {
                            return (
                                <div key={message.id} className={`flex items-end ${user?._id === message.senderId ? "flex-row-reverse" : ""}  gap-2`}>
                                    <img src={img} alt="image" className="h-6 w-6 rounded-full" />
                                    <div className="bg-blue-500/30 min-w-1/5 rounded-md relative">
                                        <p className="py-3 px-2">{message.text}</p>
                                        <span className="text-[10px] text-gray-400 absolute right-1.5 bottom-0.5">
                                            10:00 AM
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-2 px-3 py-2 border-t bg-blue-400/30">
                        <div className="border border-white flex items-center px-4 rounded-full w-4/5">
                            <div className="flex items-center w-full px-3 rounded-full">

                                <Input className="border-none focus-visible:ring-0" placeholder="Enter message" onChange={handleMessageInput} value={message} onKeyDown={handleEnterPress} />
                            </div>
                            <div className="absolute right-1.5 bottom-14" ref={emojiRef}>
                                <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">

                                <Smile className="cursor-pointer" onClick={() => setOpenEmoji(!openEmoji)} />
                                <Camera className="cursor-pointer" />
                            </div>
                        </div>
                        <SendHorizontal className="cursor-pointer" onClick={sendMessage} />
                    </div>
                </>
                : <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 border rounded-md p-2 bg-gray-100">Select a user to start chat</p>
                </div>
            }
        </div>
    )
}

export default Chat