import img from '@/assets/avatar.avif';
import { Input } from "@/components/ui/input";
import api from '@/service/axios';
import type { RootState } from '@/store';
import { addUser, setConversationId, setMessages, setSelectedUser, setUnreadCount } from '@/store/user/userSlice';
import type { User } from '@/type/user';
import { CirclePlus, EllipsisVertical, Pencil, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from "@/components/ui/badge";
import imageCompression from 'browser-image-compression';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Button } from '../ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { getErrMessage } from '@/utils/getErrMessage';
import { getChats } from '@/service/messages';
import { clearStorage } from '@/utils/storage';
const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { selectedUser, user, selectedUserMessages, unreadMessagesCount } = useSelector((state: RootState) => state.user);
    const [openDialog, setOpenDialog] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>();
    const [avatarFile, setAvatarFile] = useState<File | null>();
    const dispatch = useDispatch();
    const imgRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const [logoutDialog, setLogoutDialog] = useState<boolean>(false);
    const [newChat, setNewChat] = useState<string[]>([]);
    const [extractUsers, setExtractUser] = useState<User[]>([]);
    const [addUserBtn, setAddUserBtn] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await api.get("/api/user/getAllUsers");
                setUsers(response.data);
            } catch (err) {
                console.log(err);
            }
        }
        const fetchUnreadCounts = async () => {
            try {
                const response = await api.get("/api/message/getUnreadCounts");
                dispatch(setUnreadCount(response.data.unreadCounts));
            } catch (err) {
                console.log("Error fetching unread counts:", err);
            }
        };
        fetchUnreadCounts();

        // Get only users whom with login user already did chat
        const getChatUser = async () => {
            const response = await api.get("api/user/getChatUsers");
            setNewChat(response.data.users);
        }

        getUsers();
        getChatUser();
    }, [addUserBtn, dispatch]);

    useEffect(() => {
        const extractUser = () => {
            const extractedUsers = users.filter((user) => newChat.includes(user._id.toString()))
            setExtractUser(addUserBtn ? users : extractedUsers);
        }
        extractUser();
    }, [newChat, users, addUserBtn]);

    const getConversationId = async (receiverId: string) => {
        try {
            const response = await api.post("/api/message/getConversationId", { receiverId });
            return response.data.conversationId;
        } catch (err) {
            console.log("Error getting conversation ID:", err);
            return null;
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
        if (!(user._id in selectedUserMessages.userMessages)) {
            const response = await getChats(conversationId, "");
            dispatch(setMessages({ userMessages: { [user._id]: { messages: response.messages, loading: false } } }));
        }
    }

    const formSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters long"),
        email: z.string().min(2, "Email must be at least 2 characters long"),

    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",

        }
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
            })
        }
    }, [form, user]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {

            const formData = new FormData();
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }
            formData.append("name", data.name);
            formData.append("email", data.email);
            setOpenDialog(false);
            const response = await api.put("/api/user/update-profile", formData);
            if (response.data.success) {
                toast.success(response.data.message);
                dispatch(addUser(response.data.user));
            }
        } catch (err) {
            console.log("Error updating profile:", err);
            toast.error("Failed to update profile.");
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        }
        if (!file) return;
        const compressedImg = await imageCompression(file, options);
        const previewURL = URL.createObjectURL(compressedImg);
        setPreviewImage(previewURL);
        setAvatarFile(compressedImg);


    };

    const handleLogout = async () => {
        try {
            const response = await api.get("/api/auth/logout");
            if (response.data.success) {
                toast.success(response.data.message);
                clearStorage();
                navigate("/login");
            }
        } catch (err) {
            console.log("Error in logout", err);
            const errMsg = getErrMessage(err);
            toast.error(errMsg);
        }
    }




    return (
        <>
            <div className={`border bg-gray-300/30 ${!selectedUser ? "sm:block w-full" : "hidden"} lg:block lg:w-[20%] min-w-70 p-4 h-screen`}>
                <div className="flex justify-between items-center h-12">
                    <div className="flex items-center gap-3">
                        <img src={user?.avatar || previewImage || img} alt="profile image" className="h-9 w-9 sm:w-10 sm:h-10 rounded-full" />
                        <div className="">
                            <p className="text-sm font-medium">{user?.name}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Pencil className="h-4 w-4 sm:w-5 sm:h-5 cursor-pointer" onClick={() => setOpenDialog(true)} />
                        {/* // DropDown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <EllipsisVertical className='lg:hidden cursor-pointer' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className=''>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => setLogoutDialog(true)}>Logout</DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                </div>
                <div className='flex items-center gap-3'>
                    <div className="hidden lg:flex my-4 border items-center px-2 rounded-full bg-white">
                        <Search className='h-4 w-4' />
                        <Input placeholder="Search" onChange={(e) => setSearch(e.target.value.toLowerCase())} value={search} className="border-none w-full text-sm focus-visible:ring-0" />
                    </div>
                    <CirclePlus className='hidden lg:block h-5 w-5 cursor-pointer' onClick={() => setAddUserBtn(!addUserBtn)} />
                </div>
                <div className='border w-full my-3'></div>
                <div className='flex justify-between flex-col h-[80%]'>
                    <div className='flex flex-col gap-3'>
                        {addUserBtn &&
                            <div className="flex items-center justify-center gap-3">
                                <Button className='h-8 w-full'>New Chat</Button>
                            </div>
                        }
                        {
                            extractUsers.filter(user => user.name?.toLowerCase().includes(search)).map((user: User) => {
                                return (
                                    <div key={user._id} className={`flex justify-between bg-gray-300 items-center hover:bg-gray-400 p-2 rounded-md cursor-pointer ${selectedUser?._id === user._id ? 'bg-gray-400' : ''}`} onClick={() => handleUserTabClick(user)}>
                                        <div className="flex items-center gap-3">

                                            <img src={user.avatar || img} alt="profile image" className="sm:h-10 sm:w-10 h-9 w-9 rounded-full" />
                                            <div className="">
                                                <p className="text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500"></p>
                                            </div>
                                        </div>
                                        <div>

                                            {user.conversationId &&
                                                unreadMessagesCount[user.conversationId] > 0 && (
                                                    <Badge className="h-5 min-w-5 rounded-full px-1 font-mono">
                                                        {unreadMessagesCount[user.conversationId]}
                                                    </Badge>
                                                )}
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className='bg-black hidden lg:flex cursor-pointer h-10 rounded-sm  items-center justify-center' onClick={() => setLogoutDialog(true)}>
                        <p className='text-white'>Logout</p>
                    </div>

                </div>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <Form {...form}>

                    <form id="form" onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data" onError={() => console.log(form.getValues())}>
                        <DialogContent className="sm:max-w-106.25">
                            <DialogHeader>
                                <DialogTitle>Edit profile</DialogTitle>
                                <DialogDescription className='text-xs'>Update your profile information</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3 justify-center relative">
                                    <img src={previewImage || user?.avatar || img} alt="profile image" className='h-20 w-20 rounded-full' />
                                    <div onClick={() => imgRef.current?.click()} className='absolute bottom-0 right-[40%] bg-gray-300 rounded-full p-1'>
                                        <input type="file" className='hidden' id='profilePic' ref={imgRef} onChange={handleImageUpload} />
                                        <Pencil className="h-3 w-3 sm:w-5 sm:h-5 cursor-pointer" />
                                    </div>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>

                                                <FormControl>
                                                    <Input placeholder="Enter name" className="" {...field} />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>

                                                <FormControl>
                                                    <Input placeholder="Enter email" className="" {...field} />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" form='form'>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </form>
                </Form>
            </Dialog>

            {/* Logout dialog */}
            <AlertDialog open={logoutDialog} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setLogoutDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </>

    )
}

export default Users