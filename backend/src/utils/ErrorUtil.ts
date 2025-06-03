import Log from "./Log.ts"

class ErrorUtil {
    public static exception(err: Error, message: string = "Error") {
        Log.error(err, message)
    }
} 

export default ErrorUtil