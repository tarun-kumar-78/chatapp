import Chat from "@/components/chats/Chat";
import Users from "@/components/chats/Users";
import api from "@/service/axios";
import { socket } from "@/socket/socket";
import { getErrMessage } from "@/utils/getErrMessage";
import { useEffect } from "react";
import { toast } from "sonner";
import { useDispatch } from 'react-redux';
import { addUser } from "@/store/user/userSlice";


const Home = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await api.get(`/api/auth/user`);
                dispatch(addUser(response.data.user));
            } catch (err) {
                const errMsg = getErrMessage(err);
                toast.error(errMsg);
            }
        }
        getUser();
        socket.connect();
        socket.on("connect", () => {
            console.log("connected to server", socket.id);
        })
        socket.on("disconnect", () => {
            console.log("disconnected from server");
        })
        socket.on("connect_error", (err) => {
            console.log("connection error", err.message);
        })
        return () => {
            socket.disconnect();
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
        }
    });

    return (
        <div className="bg-white min-h-screen flex">
            <Users />
            <Chat />
            <div className="border min-w-[20%] hidden lg:flex"></div>
        </div>
    );
};

export default Home;