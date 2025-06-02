import ErrorUtil from "../utils/ErrorUtil.ts"
import { SerialPort } from "serialport"
import { ReadlineParser } from '@serialport/parser-readline';
import pinType from "../enums/PinType.ts";

class Arduino {
    public static port: string
    public static serial: number
    private static instance: Arduino
    private static serialConnection: SerialPort
    private static pipe: ReadlineParser
    public static ready: boolean = false
    private static streamnigPins: { pin: number, type: string, callBack: (...args: any[]) => void }[] = []
    private static productId: number

    private constructor() {
        Arduino.serial = Number(process.env.ARDUINO_SERIAL) || 9600
        Arduino.productId = Number(process.env.ARDUINO_PRODUCT_ID) ?? 0

        Arduino.connectArduino()
    }

    public static async connectArduino(then: (...args: any[]) => void = () => { }) {
        return new Promise(async (resolve, reject) => {
            await Arduino.searchPort()

            const serialConnection = new SerialPort({
                path: Arduino.port,
                baudRate: Arduino.serial
            })

            const parser = serialConnection.pipe(new ReadlineParser({ delimiter: '\n' }))
            Arduino.serialConnection = serialConnection
            Arduino.pipe = parser

            serialConnection.on("open", () => {
                Arduino.ready = true

                console.log(`☑️  Arduino connected on PORT:${Arduino.port} SERIAL:${Arduino.serial}`)

                then()

                resolve(true)
            })

            serialConnection.on("error", err => {
                ErrorUtil.exception(err, "Error connencting Arduino, searching port")
                Arduino.ready = false

                //Try again
                setTimeout(() => {
                    Arduino.connectArduino(then)
                }, 500)
            })
        })
    }

    private static async searchPort(): Promise<string> {
        const ports = await SerialPort.list()
        let validPort = ""

        for (const port of ports) {
            if (Arduino.productId && port.productId == Arduino.productId) {
                validPort = port.path
                break;

            }
        }

        if (!validPort) {
            validPort = "invalid port"
        }

        Arduino.port = validPort
        return validPort
    }

    public static getInstance(): Arduino {
        if (!Arduino.instance) {
            Arduino.instance = new Arduino()
        }

        return Arduino.instance
    }

    private static async checkConnection(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!Arduino.serialConnection.isOpen) {
                Arduino.connectArduino(() => resolve(true))

            } else {
                resolve(true)
            }
        })
    }

    private static async send(message: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await Arduino.checkConnection()

            if (!Arduino.serialConnection || !Arduino.ready) {
                return reject(new Error("Arduino not ready"))
            }

            Arduino.serialConnection.write(message + '\n', (err: any) => {
                if (err) {
                    reject(err)

                } else {
                    resolve(true)
                }
            })
        })
    }

    public static async ask(message: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            await Arduino.send(message)

            Arduino.pipe.once("data", (data: string) => {
                resolve(Number(data.trim())/1000)
            })

        })
    }

    public static async digitalWrite(pin: number, value: number): Promise<boolean> {
        return await Arduino.send(`w${pinType.DIGITAL.letter}${pin}:${value}`)
    }

    public static async analogWrite(pin: number, value: number): Promise<boolean> {
        return await Arduino.send(`w${pinType.ANALOG.letter}${pin}:${value}`)
    }

    public static async digitalRead(pin: number): Promise<number | any> {
        return await Arduino.ask(`p${pinType.DIGITAL.letter}${pin}`)
    }

    public static async analogRead(pin: number): Promise<number | any> {
        return await Arduino.ask(`p${pinType.ANALOG.letter}${pin}`)
    }

    private static findStream(pin: number, type: string) {
        return Arduino.streamnigPins.find(actualStream => actualStream.pin == pin && actualStream.type == type);
    }

    private static async stream(pin: number, type: string, callBack: (...args: any[]) => void): Promise<boolean> {
        //Check if stream is active
        if (this.findStream(pin, type)) {
            return true
        }

        //Start stream
        await Arduino.send(`s+${type}${pin}`)

        //Create callback
        const dataCallBack = (data: string) => {

            if (data.toString().includes(`${type}-${pin}:`)) {
                data = data.toString().trim().split(":")[1]

                callBack(data)
            }
        }

        //Save listener
        Arduino.streamnigPins.push({
            pin,
            type,
            callBack: dataCallBack
        })

        Arduino.pipe.on(`data`, dataCallBack)

        return true
    }
    private static async endStream(pin: number, type: string): Promise<boolean> {
        const originalStream = this.findStream(pin, type)//Fin original stream

        if (!originalStream) {
            return true
        }

        Arduino.pipe.off("data", originalStream.callBack)//Remove event listener
        await Arduino.send(`s-${type}${pin}`)//Stop arduino stream

        //Remove from local
        Arduino.streamnigPins = Arduino.streamnigPins.filter(actualStream => actualStream.pin != pin && actualStream.type != type)

        return true
    }

    public static async digitalStream(pin: number, callBack: (...args: any[]) => void): Promise<boolean> {
        return Arduino.stream(pin, pinType.DIGITAL.letter, callBack)
    }
    public static async digitalEndStream(pin: number): Promise<boolean> {
        return Arduino.endStream(pin, pinType.DIGITAL.letter)
    }

    public static async analogStream(pin: number, callBack: (...args: any[]) => void): Promise<boolean> {
        return Arduino.stream(pin, pinType.ANALOG.letter, callBack)
    }
    public static async analogEndStream(pin: number): Promise<boolean> {
        return Arduino.endStream(pin, pinType.ANALOG.letter)
    }
}

export default Arduino
