import Sensor from "./abstracts/Sensor.ts"
import PinsMap from "../PinsMap.json" with {type: "json"}

class SensorTest extends Sensor {
    constructor () {
        super()
        this.pins = PinsMap.pDigital
    }
}

export default SensorTest