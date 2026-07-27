import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import img from '@/assets/avatar.avif';
import { CircleAlert, Contact, Phone } from "lucide-react";

const UserProfile = () => {
    const { selectedUser } = useSelector((state: RootState) => state.user);
    return (
        <div className={`hidden min-w-[20%] border ${selectedUser ? "lg:flex" : "hidden"} flex-col gap-3 items-center h-screen p-4`}>
            <div className="w-35 h-35 rounded-full border flex justify-center items-center">
                <img src={selectedUser?.avatar || img} alt="profile img" className="h-full rounded-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 w-[80%]">
                <div className="flex gap-2 items-center">
                    <Contact className="h-6 w-6" />
                    <div className="p-1 w-full rounded-md">
                        <p>Name</p>
                        <p className="text-xs text-gray-500">{selectedUser?.name}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <CircleAlert className="h-6 w-6" />
                    <div>
                        <p>About</p>
                        <p className="text-xs text-gray-500">~{selectedUser?.name}</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Phone className="h-6 w-6" />
                    <div>
                        <p>Phone</p>
                        <p className="text-xs text-gray-500">{selectedUser?.phoneNo}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile