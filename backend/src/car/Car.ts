import EventEmitter from "events"
import Arduino from "../arduino/Arduino.ts"
import ParkingSensor from "../sensors/ParkingSensor.ts"
import Reverse from "../sensors/ReverseSensor.ts"
import SensorTest from "../sensors/SensorTest.ts"
import ErrorUtil from "../utils/ErrorUtil.ts"
import Sensor from "../sensors/abstracts/Sensor.ts"
import Speaker from "../sensors/Speaker.ts"
import Sound from "../sensors/tools/Sound.ts"

/**
 * Events
 * start
 * stop
 * startReverse 
 * endReverse 
 */

class Car {
    public static instance: Car
    private static soundList: ((...args: any[]) => void)[] = []
    private static sensors: {
        [key: string]: Sensor
    }
    private static emitter: EventEmitter

    private constructor() {
        Car.sensors = {
            parkingSensor: new ParkingSensor(),
            sensorTest: new SensorTest(),
            reverseSensor: new Reverse(),
            speaker: new Speaker()
        }

        Car.emitter = new EventEmitter()
        //Start when Arduino is ON

        Arduino.once("start", Car.start)
    }

    public static async startReverseSound() {
        return await Car.reproduceSound(async () => {
            return await Sound.startReverse(Car.sensors.speaker.tone.bind(Car.sensors.speaker))
        })
    }

    public static async endReverseSound() {
        return await Car.reproduceSound(async () => {
            return await Sound.endReverse(Car.sensors.speaker.tone.bind(Car.sensors.speaker))
        })
    }

    private static async reproduceSound(fn: (...args: any[]) => any): Promise<boolean> {

        if (!Car.soundList.find((actualFn) => actualFn.toString() == fn.toString())) {
            Car.soundList.push(fn)
            await fn()

            //Remove from list
            Car.soundList = Car.soundList.filter(actualFn => actualFn.toString() != fn.toString())
        }

        return true
    }

    private static emit(eventName: string, response: any) {
        Car.emitter.emit(eventName, response)
    }

    public static on(eventName: string, callBack: (...args: any[]) => void) {
        Car.emitter.on(eventName, callBack)
    }

    public static once(eventName: string, callBack: (...args: any[]) => void) {
        Car.emitter.once(eventName, callBack)
    }

    public static async startReverseMode(): Promise<boolean> {
        Car.streamSensor(ParkingSensor, (data) => {
            let duration = Number(data) / 2
            let delay = Number(data) / 2

            if (data < 250) {
                duration = 1000
                delay = 0
            }

            Car.reproduceSound(async () => {
                return await Sound.reproduce(Car.sensors.speaker.tone.bind(Car.sensors.speaker), [{ frecuency: 2000, duration, delay }])
            })

        })

        return true
    }

    public static async stopReverseMode(): Promise<boolean> {
        Car.endStreamSensor(ParkingSensor)

        return true
    }

    public static async start(): Promise<boolean> {
        //Start all initializable sensors
        await Car.startSensors()

        //---Config each sensor
        //Reverse sensor
        if (Car.sensors.reverseSensor) {
            Car.sensors.reverseSensor.on("startReverse", () => {
                Car.startReverseSound()
                Car.startReverseMode()
                Car.emit("startReverse", true)
            })
            Car.sensors.reverseSensor.on("endReverse", () => {
                Car.endReverseSound()
                Car.stopReverseMode()
                Car.emit("endReverse", true)
            })
        }

        Car.emit("start", true)

        return true
    }

    public static async stop(): Promise<boolean> {
        //Stop all initializable sensors
        await Car.stopSensors()

        Car.emit("stop", true)

        return true
    }

    private static async startSensors(): Promise<boolean> {
        const initializableSensors = Object.values(Car.sensors).filter((actualSensor: any) => actualSensor.initializable)

        for (let index = 0; index < initializableSensors.length; index++) {
            const actualSensor: any = initializableSensors[index]

            await actualSensor.start()
        }

        return true
    }

    private static async stopSensors(): Promise<boolean> {
        const initializableSensors = Object.values(Car.sensors).filter((actualSensor: any) => actualSensor.initializable)

        for (let index = 0; index < initializableSensors.length; index++) {
            const actualSensor: any = initializableSensors[index]

            await actualSensor.stop()
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

    public static getSensor(type: any): any {
        for (const actualSensor of Object.values(Car.sensors)) {
            if (actualSensor instanceof type) {
                return actualSensor
            }
        }

        return null;
    }

    public static async readSensor(type: any): Promise<number | null> {
        const sensor = Car.getSensor(type)

        return await sensor?.read();
    }

    public static async writeSensor(type: any, value: number): Promise<boolean | null> {
        const sensor = Car.getSensor(type)

        return await sensor?.write(value);
    }

    public static async streamSensor(type: any, callBack: (...args: any[]) => void) {
        const sensor = Car.getSensor(type)

        return await sensor.stream(callBack)
    }

    public static async endStreamSensor(type: any) {
        const sensor = Car.getSensor(type)

        return await sensor.endStream()
    }

    public static async streamDigitalSensor(pin: number, callBack: (...args: any[]) => void): Promise<boolean> {
        return await Arduino.digitalStream(pin, callBack)
    }
    public static async endStreamDigitalSensor(pin: number): Promise<boolean> {
        return await Arduino.digitalEndStream(pin)
    }

    public static async streamAnalogSensor(pin: number, callBack: (...args: any[]) => void): Promise<boolean> {
        return await Arduino.analogStream(pin, callBack)
    }
    public static async endStreamAnalogSensor(pin: number): Promise<boolean> {
        return await Arduino.analogEndStream(pin)
    }
}

export default Car