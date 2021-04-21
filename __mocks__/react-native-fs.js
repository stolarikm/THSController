export default {
    readFile: jest.fn(),
    mkdir: jest.fn(),
}

export const writeFile = () => Promise.resolve();