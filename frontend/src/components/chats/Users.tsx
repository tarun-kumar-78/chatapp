import img from '@/assets/chatapp-image.jpg';
import { Input } from "@/components/ui/input";
import api from '@/service/axios';
import type { RootState } from '@/store';
import { setConversationId, setMessages, setSelectedUser, setUnreadCount } from '@/store/user/userSlice';
import type { User } from '@/type/user';
import { Pencil, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from "@/components/ui/badge"
const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { selectedUser } = useSelector((state: RootState) => state.user);
    const { user } = useSelector((state: RootState) => state.user);
    const { unreadMessagesCount } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await api.get("/api/user/getAllUsers");
                setUsers(response.data);
            } catch (err) {
                console.log(err);
            }
        }
        getUsers();
    }, []);

    const getConversationId = async (receiverId: string) => {
        try {
            const response = await api.post("/api/message/getConversationId", { receiverId });
            return response.data.conversationId;
        } catch (err) {
            console.log("Error getting conversation ID:", err);
            return null;
        }
    }

    const getMessages = async (conversationId: string) => {
        try {
            const response = await api.post("/api/message/getMessages", { conversationId });
            return response.data.messages;
        } catch (err) {
            console.log("Error in getting messages", err);
            return [];
        }
    }

    const readMessages = async (conversationId: string) => {
        try {
            await api.put("/api/message/readMessages", { conversationId });
        } catch (err) {
            console.log("Error in reading messages", err);
        }
    }

    const handleUserTabClick = async (user: User) => {
        dispatch(setSelectedUser(user));
        await readMessages(user.conversationId);
        const conversationId = await getConversationId(user._id);
        dispatch(setConversationId(conversationId));
        const messages = await getMessages(conversationId);
        dispatch(setMessages(messages));
        console.log(messages);
    }

    useEffect(() => {
        const fetchUnreadCounts = async () => {
            try {
                const response = await api.get("/api/message/getUnreadCounts");
                dispatch(setUnreadCount(response.data.unreadCounts));
            } catch (err) {
                console.log("Error fetching unread counts:", err);
            }
        };
        fetchUnreadCounts();
    }, []);
    return (
        <div className="border bg-gray-300/30 w-full md:w-[20%] min-w-70 p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={img} alt="profile image" className="h-9 w-9 sm:w-10 sm:h-10 rounded-full" />
                    <div className="">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs">Role</p>
                    </div>
                </div>
                <Pencil className="h-4 w-4 sm:w-5 sm:h-5 cursor-pointer" />
            </div>
            <div className="flex my-4 border items-center px-2 rounded-full bg-white">
                <Search className='h-4 w-4' />
                <Input placeholder="Search" className="border-none w-full text-sm focus-visible:ring-0" />
            </div>
            <div className='border w-full my-3'></div>
            <div className='flex flex-col gap-3'>

                {
                    users.map((user: User) => {
                        return (
                            <div key={user._id} className={`flex justify-between bg-gray-300 items-center hover:bg-gray-400 p-2 rounded-md cursor-pointer ${selectedUser?._id === user._id ? 'bg-gray-400' : ''}`} onClick={() => handleUserTabClick(user)}>
                                <div className="flex items-center gap-3">

                                    <img src={img} alt="profile image" className="sm:h-10 sm:w-10 h-9 w-9 rounded-full" />
                                    <div className="">
                                        <p className="text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500">Role</p>
                                    </div>
                                </div>
                                <div>

                                    {user.conversationId &&
                                        unreadMessagesCount[user.conversationId] > 0 && (
                                            <Badge className="h-5 min-w-5 rounded-full px-1 font-mono">
                                                {unreadMessagesCount[user.conversationId]}
                                            </Badge>
                                        )}
                                    {/* <p className='text-[5px] sm:text-xs text-gray-400'>10:00 AM</p> */}
                                </div>

                            </div>
                        )
                    })
                }
            </div>
        </div>

    )
}

export default Users