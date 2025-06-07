import express from "express"
import http from "node:http"
import "dotenv/config"
import Arduino from "./arduino/Arduino.ts"
import ParkingSensor from "./sensors/ParkingSensor.ts"
import SensorTest from "./sensors/SensorTest.ts"
import Car from "./car/Car.ts"
import Reverse from "./sensors/ReverseSensor.ts"
import CarWebSocket from "./api/CarWebSockets.ts"

import { Server as ServerIo } from "socket.io"

const app = express()
const server = http.createServer(app)
const ws = new ServerIo(server, {
    cors: {
        origin: "*"
    }
})

//Middewares
app.use(express.json())

//Start singletons
Arduino.getInstance() //Se inicia Arduino y su conexión
Car.getInstance() //Todos los sensores

//Routes
new CarWebSocket(ws)

//TEST URL's
app.post("/", async (req, res) => {

    const body = req.body

    await Car.writeSensor(SensorTest, body.value)

    res.send("respuesta")
})

app.get("/", async (req, res) => {
    const actualValue = await Car.readSensor(ParkingSensor)

    res.send(actualValue)
})

app.get("/a", async (req, res) => {

    const parkin = new ParkingSensor()

    parkin.stream((data) => {
        console.log("parking: " + data)
    })

    res.send(true)
})
app.get("/b", async (req, res) => {

    const parkin = new SensorTest()
    parkin.stream((data) => {
        console.log("test: " + data)
    })

    res.send(true)
})
app.get("/ac", async (req, res) => {

    const parkin = new ParkingSensor()

    parkin.endStream()

    res.send(true)
})
app.get("/bc", async (req, res) => {

    const parkin = new SensorTest()
    parkin.endStream()

    res.send(true)
})

server.listen(Number(process.env.PORT), Number(process.env.HOST), () => {
    console.log(`Servidor iniciado en ${process.env.HOST}:${process.env.PORT}`)
})