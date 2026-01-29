import { PROD } from '@/config/config';
import { io } from 'socket.io-client';


export const socket = io(PROD, {
    autoConnect: false,
    withCredentials: true,
});