import Arduino from "../../arduino/Arduino.ts";
import pinType from "../../enums/PinType.ts";

abstract class Sensor {
    pins: {
        read?: {
            type: string,
            pin: number

        }, write?: {
            type: string,
            pin: number

        }
    }

    public async read(): Promise<number> {
        if (!Arduino.ready) return 0
        if (!this.pins.read) return 0

        let result = 0

        if (this.pins.read.type == pinType.ANALOG.name) {
            result = await Arduino.analogRead(this.pins.read.pin)

        } else if (this.pins.read.type == pinType.DIGITAL.name) {
            result = await Arduino.digitalRead(this.pins.read.pin)
        }

        return result
    }

    public async write(value: number): Promise<boolean> {
        if (!Arduino.ready) return false
        if (!this.pins.write) return false

        let result = false

        if (this.pins.write.type == pinType.ANALOG.name) {
            result = await Arduino.analogWrite(this.pins.write.pin, value)

        } else if (this.pins.write.type == pinType.DIGITAL.name) {
            result = await Arduino.digitalWrite(this.pins.write.pin, value)
        }

        return result
    }

    public async stream(callBack: (...args: any[]) => void): Promise<boolean> {
        if (!Arduino.ready) return false
        if (!this.pins.read) return false

        if (this.pins.read?.type == pinType.DIGITAL.name) {
            return Arduino.digitalStream(this.pins.read.pin, callBack)

        } else if (this.pins.read?.type == pinType.ANALOG.name) {
            return Arduino.analogStream(this.pins.read.pin, callBack)

        }

        return false
    }

    public async endStream(): Promise<boolean> {
        if (!Arduino.ready) return false
        if (!this.pins.read) return false

        if (this.pins.read?.type == pinType.DIGITAL.name) {
            return Arduino.digitalEndStream(this.pins.read.pin)

        } else if (this.pins.read?.type == pinType.ANALOG.name) {
            return Arduino.analogEndStream(this.pins.read.pin)

        }

        return false
    }
}

export default Sensor