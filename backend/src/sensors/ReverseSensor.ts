import Sensor from "./abstracts/Sensor.ts";
import PinsMap from "../PinsMap.json" with {type: "json"}

/**
 * Events
 * start
 * stop
 * startReverse
 * endReverse
 */

class ReverseSensor extends Sensor {
    private status: number

    constructor() {
        super(PinsMap.reverseSensor, true)
        this.status = 0
    }

    public async start(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this.stream((data) => {

                if (data == 1 && this.status != data) {
                    this.status = 1
                    this.emit("startReverse", data)
                }

                if (data == 0 && this.status != data) {
                    this.status = 0
                    this.emit("endReverse", data)
                }
            })

            this.emit("start", true)

            resolve(true)
        })

    }

    public async stop(): Promise<boolean> {
        this.removeAllListeners()
        this.emit("stop", true)
        return await this.endStream()
    }
}

export default ReverseSensor