import Sensor from "./abstracts/Sensor.ts";
import PinsMap from "../PinsMap.json" with {type: "json"}
import Arduino from "../arduino/Arduino.ts";

class Speaker extends Sensor {
    constructor () {
        super(PinsMap.speaker)
    }

    public async tone (frecuency: number, duration: number): Promise<boolean> {
        if (!this.pins.write) {
            return false
        }

        return await Arduino.tone(this.pins.write.pin, frecuency, duration)
    }

    
}

export default Speaker