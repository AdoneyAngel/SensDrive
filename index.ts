import express from "express"
import http from "node:http"
import "dotenv/config"
import Arduino from "./src/arduino/Arduino.ts"
import ParkingSensor from "./src/sensors/ParkingSensor.ts"
import SensorTest from "./src/sensors/SensorTest.ts"
import Car from "./src/car/Car.ts"

const app = express()
const server = http.createServer(app)

//Middewares
app.use(express.json())

//Start singletons
Arduino.getInstance() //Se inicia Arduino y su conexión
Car.getInstance() //Todos los sensores

//TEST URL's
app.post("/", async (req, res) => {

    const body = req.body

    Car.writeSensor(SensorTest, body.value)

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