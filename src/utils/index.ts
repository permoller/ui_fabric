export const timeoutAsync = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));
export const getRandomString = () => Math.round((100 * Math.random())).toString();
export const getRandomStrings = () => [getRandomString(), getRandomString(), getRandomString()];

export const stringify = (obj?: any) => {
    try {
        return stringifyRecursive(0, obj);
    } catch {
        return "se data i konsollen";
    }
}

const stringifyRecursive = (depth: number, obj?: any): string => {
    if (obj === undefined || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return "[" + obj.map((v) => stringifyRecursive(depth + 1, v)).reduce((prev, cur) => prev + ", " + cur) + "]";
    }

    if (typeof obj === "function") {
        return "function";
    }

    if (typeof obj !== "object") {
        return obj.toString();
    }

    if (depth > 1) {
        return obj.toString();
    }
    // Hvis det hele ikke kunne laves om til JSON prøver vi med en property ad gangen
    let str = "";
    let delimiter = "{ ";
    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            const value = obj[prop];
            if (typeof value !== "function") {
                str += delimiter + prop + ":" + stringifyRecursive(depth + 1, obj[prop]);
                delimiter = ", ";
            }
        }
    }
    str += " }"
    return str;

}