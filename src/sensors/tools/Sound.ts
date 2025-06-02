import SoundList from "../../Sounds.json" with {type: "json"}

class Sound {
    private static async reproduce(fn: (frecuency: number, duration: number) => Promise<any>, soundMap: {frecuency: number, duration: number, delay: number}[]): Promise<boolean> {
        for (const melody of soundMap) {
            await this.delay(melody.delay)
            await fn(melody.frecuency, melody.duration)
        }

        return true
    }

    public static async startReverse(fn: (frecuency: number, duration: number) => Promise<any>): Promise<boolean> {
        return await this.reproduce(fn, SoundList.startReverse)
    }
    public static async endReverse(fn: (frecuency: number, duration: number) => any): Promise<boolean> {
        return await this.reproduce(fn, SoundList.startReverse)
    }

    private static async delay(duration: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true)
            }, duration);
        })
    }
}

export default Sound