import { io } from 'socket.io-client';
import { apiDomain } from '../../../domain';
const URL = `${apiDomain}`;
export const socket = io(URL, {autoConnect: false});