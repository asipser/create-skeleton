{{#socket}}
import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
{{#socket.users}}
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});
{{/socket.users}}
{{/socket}}
