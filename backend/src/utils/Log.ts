class Log { 
    public static error(err: Error, details: string = "Error"): void {
        console.log("\n")

        console.log("❌❌❌ ERROR ↘️")
        console.log(`Error: ${err.stack}`)
        console.log(`Message: ${err.message}`)
        console.log(`Details: ${details}`)
        console.log(`❌❌❌`)

        console.log("\n")
    }
} 

export default Log