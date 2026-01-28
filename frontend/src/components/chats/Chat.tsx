import { Bell, BellOff, Camera, SendHorizontal, Smile } from "lucide-react"
import img from '@/assets/chatapp-image.jpg';
import { Input } from "../ui/input";
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket/socket";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Message } from "@/type/message";
import { extractTime12Hour } from "@/utils/extractTime";
import { incrementUnreadCount } from "@/store/user/userSlice";
import audio from '@/assets/whatsapp_pc.mp3';
import { Scrollbar } from 'react-scrollbars-custom';
import { Image } from 'lucide-react';
import api from "@/service/axios";

const Chat = () => {
    const [openEmoji, setOpenEmoji] = useState(false);
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const [message, setMessage] = useState<string>("");
    const { user } = useSelector((state: RootState) => state.user);
    const { selectedUser } = useSelector((state: RootState) => state.user);
    const { selectedUserMessages } = useSelector((state: RootState) => state.user);
    const { conversationId } = useSelector((state: RootState) => state.user);
    const [messages, setMessages] = useState<Message[]>([]);
    const [mute, setMute] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [cameraOpen, setCameraOpen] = useState<boolean>(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const imgRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const handleEmoji = (e: EmojiClickData) => {
        setMessage(message + e.emoji);
        setOpenEmoji(false);
    }

    useEffect(() => {
        setMessages(selectedUserMessages);
    }, [selectedUserMessages]);

    useEffect(() => {
        audioRef.current = new Audio(audio);
    }, []);

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
            if (message.conversationId !== conversationId) {
                audioRef.current?.play();
                dispatch(incrementUnreadCount(message.conversationId));
            } else {

                setMessages((prev) => {
                    const updated = [...prev, message];
                    return updated;
                });
            }
        });
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            socket.off("recieve-message");
        };

    });



    const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

    const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && message !== "")
            sendMessage();
    }

    const sendMessage = () => {
        if (!selectedUser || !user || message === "") return;
        const msg: Message = {
            _id: Date.now().toString(),
            senderId: user._id,
            recieverId: selectedUser?._id,
            content: message,
            createdAt: new Date().toString(),
            type: "text"
        }
        setMessages((prev) => [...prev, msg]);
        socket.emit("message", msg);
        setMessage("");
    }

    const startCamera = async () => {
        setCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setMediaStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    }

    const stopCamera = async () => {
        mediaStream?.getTracks().forEach(track => track.stop());
        setCameraOpen(false);
        setMediaStream(null);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }

    const captureImage = async (): Promise<Blob | null> => {
        if (!videoRef.current) return null;

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        console.log(canvas);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);
        stopCamera();
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => resolve(blob),
                "image/jpeg",
                0.7 // compression (important)
            );
        });
    };

    const clickImage = async () => {
        const imageBlob = await captureImage();
        if (imageBlob) {
            const formData = new FormData();
            formData.append("image", imageBlob);
        }
        stopCamera();
    }

    const shareImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("image", file);
            if (user && selectedUser) {
                formData.append("senderId", user._id.toString());
                formData.append("receiverId", selectedUser._id.toString());
            }
            const response = await api.post("/api/message/share-image", formData);
            console.log(response.data.imageUrl);
            if (!user || !selectedUser) return;
            const msg: Message = {
                _id: Date.now().toString(),
                senderId: user._id,
                recieverId: selectedUser?._id,
                content: response.data.imageUrl,
                createdAt: new Date().toString(),
                type: "image",
            }
            socket.emit("message", msg);
            setMessages(prev => [...prev, msg]);
        } catch (err) {
            console.log("Error in share image api", err);
        }
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
                    <div className="flex-1 flex flex-col gap-3 justify-end p-3">

                        {cameraOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                                <div className="bg-white rounded-xl p-4 shadow-lg w-80">
                                    <video
                                        ref={videoRef}
                                        className="rounded-lg w-full h-56 object-cover"
                                    />

                                    <div className="flex justify-between mt-3">
                                        <button
                                            className="px-3 py-1 bg-gray-200 rounded cursor-pointer"
                                            onClick={stopCamera}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
                                            onClick={clickImage}
                                        >
                                            Capture
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <Scrollbar noScrollX className="[&_.ScrollbarsCustom-Content]:flex [&_.ScrollbarsCustom-Content]:flex-col [&_.ScrollbarsCustom-Content]:justify-end"
                            trackYProps={{
                                style: {
                                    width: 0,
                                    background: "transparent"
                                }
                            }}>

                            {messages?.map((message: Message) => {
                                return (
                                    <div key={message._id} className={`flex items-end my-3 px-2 ${user?._id === message.senderId ? "flex-row-reverse" : ""}  gap-2`}>
                                        <img src={img} alt="image" className="h-6 w-6 rounded-full" />
                                        <div className={`bg-blue-500/30 min-w-1/5 rounded-md relative ${message.type == "text" && "pt-2 pb-3 px-2"} ${user?._id === message.senderId ? "bg-green-500/30" : "bg-blue-500/30"}`}>
                                            {message.type === "text" ? <p className="text-sm mb-1">{message.content}</p> : <img src={message.content} alt="sent image" className="max-w-xs max-h-50 rounded-md" />}
                                            <span className="text-[10px] text-gray-400 absolute z-50 right-1.5 bottom-0.5">
                                                {extractTime12Hour(message.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                        </Scrollbar>

                    </div>
                    <div className="flex items-center justify-center gap-2 px-3 py-2 border-t bg-blue-400/30">
                        <div className="border border-white flex justify-between px-2 rounded-full w-4/5">
                            <div className="flex items-center w-full pr-3 rounded-full">

                                <Input className="border-none focus-visible:ring-0" placeholder="Enter message" onChange={handleMessageInput} value={message} onKeyDown={handleEnterPress} />
                            </div>
                            <div className="absolute right-1.5 bottom-14" ref={emojiRef}>
                                <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">

                                <Smile className="cursor-pointer" onClick={() => setOpenEmoji(!openEmoji)} />
                                <Camera className="cursor-pointer" onClick={startCamera} />
                                <Image className="cursor-pointer" onClick={() => imgRef.current?.click()} />
                                <input type="file" className="hidden" ref={imgRef} onChange={shareImage} />
                            </div>
                        </div>
                        <SendHorizontal className={`cursor-pointer ${message === "" && "text-gray-400"}`} onClick={sendMessage} />
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