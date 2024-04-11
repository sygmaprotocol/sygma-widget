export default class ApiPromise {
  get isReady(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
