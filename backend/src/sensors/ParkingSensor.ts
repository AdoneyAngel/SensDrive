import Arduino from "../arduino/Arduino.ts"
import PinsMap from "../PinsMap.json" with {type: "json"}
import Sensor from "./abstracts/Sensor.ts"

class ParkingSensor extends Sensor{
    constructor () {
        super(PinsMap.parkingSensor)
    }

    public stream(callBack: (...args: any[]) => void): Promise<boolean> {
        return Arduino.streamProximity(this.pins.read?.pin ?? 1, this.pins.write?.pin ?? 1, callBack)
    }

    public endStream(): Promise<boolean> {
        return Arduino.endStreamProximity(this.pins.read?.pin ?? 1, this.pins.write?.pin ?? 1)
    }
}

export default ParkingSensor