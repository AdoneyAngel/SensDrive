import { Server, Socket } from "socket.io"
import WebSockets from "./WebSockets.ts"
import Car from "../car/Car.ts"

class CarWebSockets extends WebSockets {
    constructor(ws: Server) {
        super(ws)

        this.serverEvents = {
            // connection: ()=>{}
        }

        this.socketEvents = {
            digitalRead: this.onDigitalRead.bind(this),
            analogRead: this.onAnalogRead.bind(this),
            digitalStream: this.onDigitalStream.bind(this),
            endDigitalStream: this.onEndDigitalStream.bind(this),
            analogStream: this.onAnalogStream.bind(this),
            endAnalogStream: this.onEndAnalogStream.bind(this)
        }

        this.startEvents()
    }

    private async onDigitalRead(pin: number) {
        if (!Number(pin)) {
            return 0
        }

        const value = await Car.readDigitalSensor(pin)

        this.emit(`pd${pin}`, value)

    }

    private async onAnalogRead(pin: number) {
        if (!Number(pin)) {
            return 0
        }

        const value = await Car.readAnalogSensor(pin)

        this.emit(`pa${pin}`, value)

    }

    private async onDigitalStream(pin: number) {
        if (!Number(pin)) return;

        await Car.streamDigitalSensor(pin, (data) => {
            this.emit(`sd${pin}`, data)
        })
    }
    private async onEndDigitalStream(pin: number) {
        if (!Number(pin)) return;

        Car.endStreamDigitalSensor(pin)
    }

    private async onAnalogStream(pin: number) {
        if (!Number(pin)) return;

        await Car.streamAnalogSensor(pin, (data) => {
            this.emit(`sa${pin}`, data)
        })
    }
    private async onEndAnalogStream(pin: number) {
        if (!Number(pin)) return;

        Car.endStreamAnalogSensor(pin)
    }

}

export default CarWebSockets