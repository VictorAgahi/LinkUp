import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../auth/authContext';
import {getToken} from "~/lib/store/secureStore";
import { BACKEND_URL } from '@env';

type User = {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
};

type WebsocketContextType = {
    socket: Socket | null;
    onlineUsers: User[];
};

const WebsocketContext = createContext<WebsocketContextType>({
    socket: null,
    onlineUsers: [],
});

export const useWebsocket = () => useContext(WebsocketContext);

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

    useEffect(() => {
        let newSocket: Socket;

        const initSocket = async () => {
            try {
                const token = await getToken('accessToken');
                if (!token) return;

                newSocket = io(BACKEND_URL, {
                    auth: {
                        token: `Bearer ${token}`,
                    },
                    transports: ['websocket'],
                });

                newSocket.on('connect', () => {
                    console.log('Connected!');
                    newSocket.on('users:online', (users: User[]) => {
                        console.log('Online users:', users);
                        setOnlineUsers(users);
                    });
                });

            } catch (error) {
                console.error('WebSocket error:', error);
            }
        };

        if (isAuthenticated) {
            initSocket();
        }

        return () => {
            if (newSocket) {
                newSocket.off('users:online');
                newSocket.disconnect();
            }
        };
    }, [isAuthenticated]);

    return (
        <WebsocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </WebsocketContext.Provider>
    );
};