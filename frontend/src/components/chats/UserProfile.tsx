import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import img from '@/assets/chatapp-image.jpg';

const UserProfile = () => {
    const { selectedUser } = useSelector((state: RootState) => state.user);
    return (
        <div className="flex flex-col gap-3 items-center w-full h-full p-4">
            <div className="w-40 h-40 rounded-full border flex justify-center items-center">
                <img src={selectedUser?.avatar || img} alt="profile img" className="h-full rounded-full w-full object-cover" />
            </div>
            <div className="flex flex-col w-[80%]">
                <div className="p-1 border">Name: {selectedUser?.name}</div>
                <div className="p-1 border">Email: {selectedUser?.email}</div>
            </div>
        </div>
    )
}

export default UserProfile