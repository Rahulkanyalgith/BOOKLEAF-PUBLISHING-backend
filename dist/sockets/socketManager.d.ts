import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
export declare const getIO: () => SocketServer;
export declare const initializeSocket: (httpServer: HttpServer) => SocketServer;
//# sourceMappingURL=socketManager.d.ts.map