import img from '@/assets/chatapp-image.jpg';
import { Input } from "@/components/ui/input";
import api from '@/service/axios';
import type { RootState } from '@/store';
import { addUser, setConversationId, setMessages, setSelectedUser, setUnreadCount } from '@/store/user/userSlice';
import type { User } from '@/type/user';
import { LogOut, Pencil, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from "@/components/ui/badge"
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
const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { selectedUser } = useSelector((state: RootState) => state.user);
    const { user } = useSelector((state: RootState) => state.user);
    const { unreadMessagesCount } = useSelector((state: RootState) => state.user);
    const [openDialog, setOpenDialog] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>();
    const [avatarFile, setAvatarFile] = useState<File | null>();
    const dispatch = useDispatch();
    const imgRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const [logout, setLogout] = useState<boolean>(false);

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
        if (!file) return;
        const previewURL = URL.createObjectURL(file);
        setPreviewImage(previewURL);
        setAvatarFile(file);


    };

    const handleLogout = async () => {
        try {
            const response = await api.get("/api/auth/logout");
            if (response.data.success) {
                toast.success(response.data.message);
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
            <div className="border bg-gray-300/30 w-full md:w-[20%] min-w-70 p-4">
                <div className="flex justify-between items-center h-12">
                    <div className="flex items-center gap-3">
                        <img src={user?.avatar || previewImage || img} alt="profile image" className="h-9 w-9 sm:w-10 sm:h-10 rounded-full" />
                        <div className="">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs">Role</p>
                        </div>
                    </div>
                    <Pencil className="h-4 w-4 sm:w-5 sm:h-5 cursor-pointer" onClick={() => setOpenDialog(true)} />
                </div>
                <div className="flex my-4 border items-center px-2 rounded-full bg-white">
                    <Search className='h-4 w-4' />
                    <Input placeholder="Search" className="border-none w-full text-sm focus-visible:ring-0" />
                </div>
                <div className='border w-full my-3'></div>
                <div className='flex justify-between flex-col h-[80%]'>

                    <div className='flex flex-col gap-3'>

                        {
                            users.map((user: User) => {
                                return (
                                    <div key={user._id} className={`flex justify-between bg-gray-300 items-center hover:bg-gray-400 p-2 rounded-md cursor-pointer ${selectedUser?._id === user._id ? 'bg-gray-400' : ''}`} onClick={() => handleUserTabClick(user)}>
                                        <div className="flex items-center gap-3">

                                            <img src={user.avatar || img} alt="profile image" className="sm:h-10 sm:w-10 h-9 w-9 rounded-full" />
                                            <div className="">
                                                <p className="text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500">{ }</p>
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
                    <div className='flex items-center justify-center cursor-pointer'>
                        <div className='flex gap-3 bg-black p-1 text-white items-center rounded-sm' onClick={() => setLogout(true)}>
                            <span>Logout</span>
                            <LogOut className='h-5 w-5' />
                        </div>
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
            <AlertDialog open={logout} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setLogout(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>

    )
}

export default Users