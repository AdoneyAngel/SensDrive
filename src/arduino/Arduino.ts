import "dotenv/config"
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
    private static streamnigPins: {pin: number, type: string, callBack: (...args: any[]) => void}[] = []

    private constructor() {
        Arduino.port = process.env.ARDUINO_PORT ?? ""
        Arduino.serial = Number(process.env.ARDUINO_SERIAL) || 9600

        Arduino.connectArduino()
    }

    public static connectArduino() {
        try {
            const serialConnection = new SerialPort({
                path: Arduino.port,
                baudRate: Arduino.serial
            })

            const parser = serialConnection.pipe(new ReadlineParser({ delimiter: '\n' }))
            Arduino.serialConnection = serialConnection
            Arduino.pipe = parser

            serialConnection.on("open", () => {
                Arduino.ready = true
            })

            serialConnection.on("error", err => {
                ErrorUtil.exception(err)
                Arduino.ready = false
                setTimeout(Arduino.connectArduino, 2000)
            })

        } catch (err: any) {
        }
    }

    public static getInstance(): Arduino {
        if (!Arduino.instance) {
            Arduino.instance = new Arduino()
        }

        return Arduino.instance
    }

    private static async send(message: string): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!Arduino.serialConnection || !Arduino.ready) {
                return reject(new Error("Arduino not ready"))
            }

            Arduino.pipe.once("data", (data: string) => {
                resolve(Number(data.trim())/1000)
            })

            Arduino.serialConnection.write(message + '\n', (err: any) => {
                if (err) {
                    reject(err)
                }
            })
        })
    }

    public static async digitalWrite(pin: number, value: number): Promise<number> {
        return Arduino.send(`w${pinType.DIGITAL.letter}${pin}:${value}`)
    }

    public static async analogWrite(pin: number, value: number): Promise<number> {
        return Arduino.send(`w${pinType.ANALOG.letter}${pin}:${value}`)
    }

    public static async digitalRead(pin: number): Promise<number | any> {
        return Arduino.send(`p${pinType.DIGITAL.letter}${pin}`)
    }

    public static async analogRead(pin: number): Promise<number | any> {
        return Arduino.send(`p${pinType.ANALOG.letter}${pin}`)
    }

    private static findStream(pin: number, type: string) {
        return Arduino.streamnigPins.find(actualStream => actualStream.pin == pin && actualStream.type == type);
    }

    private static async stream(pin: number, type: string, callBack: (...args: any[]) => void): Promise<boolean>{
        //Check if stream is active
        if (this.findStream(pin, type)) {
            return true
        }

        //Start stream
        await Arduino.send(`s+${type}${pin}`)

        //Create callback
        const dataCallBack = (data:string) => {
            
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
