import Arduino from "../arduino/Arduino.ts"
import Sensor from "../sensors/abstracts/Sensor.ts"
import ParkingSensor from "../sensors/ParkingSensor.ts"
import Reverse from "../sensors/ReverseSensor.ts"
import SensorTest from "../sensors/SensorTest.ts"
import ErrorUtil from "../utils/ErrorUtil.ts"

class Car {
    public static instance: Car
    private static sensors: {}

    private constructor() {
        Car.sensors = {
            parkingSensor: new ParkingSensor(),
            sensorTest: new SensorTest(),
            reverseSensor: new Reverse()
        }

        //Start when Arduino is ON

        Arduino.on("start", Car.start)
    }

    public static async start(): Promise<boolean> {
        //Start all initializable sensors
        await Car.startSensors()

        return true
    }

    private static async startSensors(): Promise<boolean> {
        const initializableSensors = Object.values(Car.sensors).filter((actualSensor:any) => actualSensor.initializable)

        for (let index = 0; index<initializableSensors.length; index++) {
            const actualSensor:any = initializableSensors[index]

            await actualSensor.start()
        }

        return true
    }

    public static getInstance(): Car {
        if (!Car.instance) {
            Car.instance = new Car()
        }

        return Car.instance
    }

    public static async readAnalogSensor(pin: number): Promise<number> {
        try {
            const result = await Arduino.analogRead(pin)

            return result

        } catch (err) {
            ErrorUtil.exception(err)

            return 0
        }
    }
    public static async writeAnalogSensor(pin: number, value: number): Promise<boolean> {
        try {
            return await Arduino.analogWrite(pin, value)

        } catch (err) {
            ErrorUtil.exception(err)

            return false
        }
    }

    public static async readDigitalSensor(pin: number): Promise<number> {
        try {
            const result = await Arduino.digitalRead(pin)

            return result

        } catch (err) {
            ErrorUtil.exception(err)

            return 0
        }
    }
    public static async writeDigitalSensor(pin: number, value: number): Promise<boolean> {
        try {
            return await Arduino.digitalWrite(pin, value)

        } catch (err) {
            ErrorUtil.exception(err)

            return false
        }
    }

    public static getSensors() {
        return this.sensors
    }

    public static async readSensor(type: any): Promise<number|null>{

        for (const actualSensor of Object.values(Car.sensors)) {
            if (actualSensor instanceof type) {
                return await actualSensor.read()
            }
        }

        return null;
    }

    public static async writeSensor(type: any, value: number): Promise<number|null>{

        for (const actualSensor of Object.values(Car.sensors)) {
            if (actualSensor instanceof type) {
                return await actualSensor.write(value)
            }
        }

        return null;
    }
}

export default Car