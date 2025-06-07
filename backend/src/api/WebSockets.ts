import { Server, Socket } from "socket.io";

abstract class WebSockets {
    protected serverEvents: {
        [key: string]: (...args: any[]) => void
    }
    protected socketEvents: {
        [key: string]: (message: any) => void
    }
    private defaultServerEvents: {
        [key: string]: (...args: any[]) => void
    }
    private defaultSocketEvents: {
        [key: string]: (...args: any[]) => void
    }
    protected ws: Server
    protected socket: Socket|null

    constructor(ws: Server) {
        this.ws = ws

        this.socket = null

        this.serverEvents = {
        }
        this.socketEvents = {
        }

        this.defaultServerEvents = {
            connection: this.onConnection.bind(this)
        }
        this.defaultSocketEvents = {
            disconnect: this.onDisconnect.bind(this)
        }
    }

    private onConnection(socket: Socket) {
        this.socket = socket
        console.log("🔵 Client websocket connected to " + this.constructor.name + `: ${this.socket.id}`)
    }

    private onDisconnect() {
        console.log("🔴 Client websocket disconnected from " + this.constructor.name + `: ${this.socket?.id}`)
    }

    protected startEvents(): void {
        let connectionEventExist = false

        this.serverEvents = {
            ...this.defaultServerEvents,
            ...this.serverEvents
        }

        //Start server events
        Object.keys(this.serverEvents).forEach((eventName: string) => {
            let eventMethod = this.serverEvents[eventName]

            if (eventName == "connection") {
                connectionEventExist = true

                eventMethod = (socket: Socket) => {
                    //Start socket events
                    this.startSocketEvents(socket)

                    //Start the default connection event
                    this.serverEvents[eventName](socket)
                }
            }

            this.ws.on(eventName, eventMethod)
        })

        //If no connectionEvent, create it
        if (!connectionEventExist) {
            this.ws.on("connection", (socket: Socket) => {
                this.startSocketEvents(socket)
            })
        }
    }

    protected startSocketEvents(socket: Socket) {
        this.socketEvents = {
            ...this.defaultSocketEvents,
            ...this.socketEvents
        }

        Object.keys(this.socketEvents).forEach((socketEventName: string) => {
            const socketEvent = this.socketEvents[socketEventName]

            socket.on(socketEventName, (message) => socketEvent(message))
        })
    }

    protected emit(eventName: string, ...args: any[]) {
        if (!this.socket) return;

        this.socket.emit(eventName, ...args)
    }

}

export default WebSockets