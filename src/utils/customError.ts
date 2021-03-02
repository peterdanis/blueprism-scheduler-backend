export default class CustomError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}
