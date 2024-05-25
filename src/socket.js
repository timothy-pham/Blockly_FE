import { io } from 'socket.io-client';
const CONNECTION_PORT = process.env.REACT_APP_API_URL;
export const socket = io(CONNECTION_PORT);


