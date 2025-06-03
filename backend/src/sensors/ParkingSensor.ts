import PinsMap from "../PinsMap.json" with {type: "json"}
import Sensor from "./abstracts/Sensor.ts"

class ParkingSensor extends Sensor{
    constructor () {
        super(PinsMap.parkingSensor)
    }
}

export default ParkingSensor