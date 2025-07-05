import fs from "fs";

export class Logger {
  static readonly COLORS = {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    red: "\x1b[31m",
  };

  static readonly LEVEL_COLORS = {
    INFO: Logger.COLORS.green,
    WARN: Logger.COLORS.yellow,
    ERROR: Logger.COLORS.red,
  };

  constructor(
    private readonly color: keyof typeof Logger.COLORS,
    private readonly prefix: string,
  ) {}

  private log(level: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const upperLevel = level.toUpperCase();
    const message = args.map(String).join(" ");
    const logLine = `${timestamp} [${upperLevel}]: (${this.prefix.toUpperCase()}) ${message}\n`;

    fs.promises
      .appendFile("app.log", logLine)
      .catch((e) => console.error("Logger FS Error:", e));

    const levelColor =
      Logger.LEVEL_COLORS[upperLevel as keyof typeof Logger.LEVEL_COLORS] || "";
    const prefixColor = Logger.COLORS[this.color];

    console.log(
      `${timestamp} ${levelColor}[%s]\x1b[0m ${prefixColor}(%s)\x1b[0m %s`,
      upperLevel,
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
