import fs from "fs";
import os from "os";
import path from "path";

const SESSION_FILE = path.join(
  os.tmpdir(),
  "clean-arch-cli-session.json"
);

export class SessionDB<T extends object> {
    private data: Partial<T> = {};

    set<K extends keyof T>(key: K, value: T[K]): void {
        this.data[key] = value;
        fs.writeFileSync(SESSION_FILE, JSON.stringify(this.data, null, 2));
    }

    get<K extends keyof T>(key: K): T[K] | undefined {
        return this.data[key];
    }

    // call before call that requires a database call.
    load(): void {
        if (!fs.existsSync(SESSION_FILE)) return;
        const raw = fs.readFileSync(SESSION_FILE, "utf-8");
        this.data = JSON.parse(raw) as Partial<T>;
    }

    exists(): boolean {
        return fs.existsSync(SESSION_FILE);
    }

    clear(): void {
        this.data = {};
        if (this.exists()) fs.unlinkSync(SESSION_FILE);
    }
}