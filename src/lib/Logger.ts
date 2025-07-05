import fs from "fs";

export class Logger {
  static readonly COLORS = {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  };

  constructor(
    private readonly color: keyof typeof Logger.COLORS,
    private readonly prefix: string,
  ) {}

  private log(level: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const message = args.map(String).join(" ");
    const logLine = `${timestamp} [${level.toUpperCase()}]: (${this.prefix.toUpperCase()}) ${message}\n`;

    fs.promises
      .appendFile("app.log", logLine)
      .catch((e) => console.error("Logger FS Error:", e));

    const colorCode = Logger.COLORS[this.color];
    console.log(
      `${timestamp} [${level.toUpperCase()}]: ${colorCode}(%s)\x1b[0m %s`,
      this.prefix.toUpperCase(),
      message,
    );
  }

  warn(...args: any[]) {
    this.log("WARN", ...args);
  }

  info(...args: any[]) {
    this.log("INFO", ...args);
  }

  error(...args: any[]) {
    this.log("ERROR", ...args);
  }
}
