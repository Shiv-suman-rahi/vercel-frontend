import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { backendUrl } from '../config';

export function useSocket() {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const socket = io(backendUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const updateConnection = (status) => setConnectionStatus(status);

    socket.on('connect', () => updateConnection('connected'));
    socket.on('disconnect', () => updateConnection('disconnected'));
    socket.on('connect_error', () => updateConnection('reconnecting'));
    socket.on('reconnect', () => updateConnection('connected'));
    socket.on('reconnect_attempt', () => updateConnection('reconnecting'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, connectionStatus };
}
