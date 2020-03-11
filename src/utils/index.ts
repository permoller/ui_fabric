export const timeoutAsync = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));
export const getRandomString = () => Math.round((100 * Math.random())).toString();
export const getRandomStrings = () => [getRandomString(), getRandomString(), getRandomString()];