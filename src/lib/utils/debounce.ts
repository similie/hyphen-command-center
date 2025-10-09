export class Debounce {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  public bounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    const _self = this;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
      if (_self.timeoutId !== null) {
        _self.clear();
      }
      _self.timeoutId = setTimeout(() => {
        func.apply(this, args);
        _self.timeoutId = null;
      }, wait);
    };
  }
  public clear() {
    if (this.timeoutId === null) {
      return;
    }
    clearTimeout(this.timeoutId);
  }
}
