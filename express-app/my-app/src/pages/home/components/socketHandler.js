import { io } from 'socket.io-client';
import { domain } from '../../../domain';
const URL = `http://${domain}`;
export const socket = io(URL, {autoConnect: false});