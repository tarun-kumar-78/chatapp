import img from '@/assets/chatapp-image.jpg';
import api from '@/service/axios';
import type { RootState } from '@/store';
import { getErrMessage } from '@/utils/getErrMessage';
import { MessageCircleWarning, Pencil, Phone, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
const UserProfile = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const imgRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string>();

    const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;
            const imgUrl = URL.createObjectURL(file);
            setPreview(imgUrl);
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await api.put("/api/user/update-profile", formData);
            if (response.data.success) {
                toast.success(response.data.message);
            }
        } catch (err) {
            const errMsg = getErrMessage(err);
            toast.error(errMsg);
        }
    }

    return (
        <div className="border min-w-[20%] hidden lg:flex flex-col p-4 bg-gray-300/30">
            <div className='flex justify-center'>

                <div className='h-20 w-20 rounded-full relative'>
                    <img src={user?.avatar || preview || img} alt="profile-image" className='h-full w-full rounded-full' />
                    <div className='absolute right-1 h-6 w-6 bottom-0 bg-gray-200 border border-black flex items-center justify-center p-1 rounded-full cursor-pointer'>
                        <Pencil onClick={() => imgRef.current?.click()} />
                    </div>
                    <input type="file" className='hidden' ref={imgRef} onChange={handleEditImage} accept='image/*' />
                </div>
            </div>
            <div className='flex flex-col gap-5 mt-8'>
                <div className='flex items-center gap-4'>
                    <User className='h-5 w-5' />
                    <div className='flex flex-col'>
                        <span className='text-sm'>Name</span>
                        <span className='text-xs text-gray-400'>{user?.name}</span>
                    </div>
                </div>
                <div className='flex items-center gap-4'>
                    <MessageCircleWarning className='h-5 w-5' />
                    <div className='flex flex-col'>
                        <span className='text-sm'>About</span>
                        <span className='text-xs text-gray-400'>~Tarun Kumar</span>
                    </div>
                </div>
                <div className='flex items-center gap-4'>
                    <Phone className='h-5 w-5' />
                    <div className='flex flex-col'>
                        <span className='text-sm'>Phone</span>
                        <span className='text-xs text-gray-400'>7807215499</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default UserProfile