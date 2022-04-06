export class Stopwatch {
  private startTime = 0;
  private endTime = 0;
  private time = 0;
  private readonly name;

  constructor(timerName = '') {
    this.name = timerName;
  }

  start(log = false): void {
    this.startTime = Date.now();
    this.time = 0;
    if (log) console.log(`${this.name} started.`);
  }

  stop(log = false): void {
    this.endTime = Date.now();
    this.time = this.endTime - this.startTime;
    if (log) console.log(`${this.name} stopped.`);
  }

  result(): number {
    return this.time;
  }

  printResult(): void {
    console.log(`${this.name} ${this.time} msec`);
  }
}
