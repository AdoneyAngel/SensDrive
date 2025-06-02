import Sensor from "./abstracts/Sensor.ts";
import PinsMap from "../PinsMap.json" with {type: "json"}

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

            resolve(true)
        })

    }

    public async stop(): Promise<boolean> {
        return await this.endStream()
    }
}

export default ReverseSensor