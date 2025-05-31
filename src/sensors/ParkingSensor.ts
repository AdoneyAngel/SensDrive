import PinsMap from "../PinsMap.json" with {type: "json"}
import Sensor from "./abstracts/Sensor.ts"

class ParkingSensor extends Sensor{
    constructor () {
        super()
        this.pins = PinsMap.parkingSensor
    }
}

export default ParkingSensor