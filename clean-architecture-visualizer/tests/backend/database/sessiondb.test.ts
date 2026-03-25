import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach} from '@jest/globals';
import { SessionDB } from "../../../src/database/sessionDb.js";
import type { SessionData } from "../../../src/types/sessionData.js";

const SESSION_FILE = path.join(os.tmpdir(), "clean-arch-cli-session.json");

describe("SessionDB", () => {
    let db: SessionDB<SessionData>;

    beforeEach(() => {
        if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
        db = new SessionDB<SessionData>();
        db.clear();
    });

    afterEach(() => {
        if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
    });

    describe("exists()", () => {
        it("returns false when no session file exists", () => {
            expect(db.exists()).toBe(false);
        });

        it("returns true after a value is set", () => {
            db.set("projectName", "CSC207");
            expect(db.exists()).toBe(true);
        });
    });

    describe("set() and get()", () => {
        it("sets and gets a string value", () => {
            db.set("projectName", "CSC207");
            expect(db.get("projectName")).toBe("CSC207");
        });

        it("sets and gets a number value", () => {
            db.set("numUseCases", 5);
            expect(db.get("numUseCases")).toBe(5);
        });

        it("overwrites an existing value", () => {
            db.set("projectName", "Old Name");
            db.set("projectName", "New Name");
            expect(db.get("projectName")).toBe("New Name");
        });

        it("returns undefined for a key that hasn't been set", () => {
            expect(db.get("projectName")).toBeUndefined();
        });
    });

    describe("load()", () => {
        it("does nothing if no session file exists", () => {
            db.load();
            expect(db.get("projectName")).toBeUndefined();
        });

        it("restores data from a previous session", () => {
            db.set("projectName", "CSC207");
            db.set("numUseCases", 10);

            const db2 = new SessionDB<SessionData>();
            db2.load();

            expect(db2.get("projectName")).toBe("CSC207");
            expect(db2.get("numUseCases")).toBe(10);
        });

        it("restores nested data correctly", () => {
            db.set("files", { "User.java": "src/entities/User.java" });

            const db2 = new SessionDB<SessionData>();
            db2.load();

            expect(db2.get("files")).toEqual({ "User.java": "src/entities/User.java" });
        });
    });

    describe("clear()", () => {
        it("removes the session file", () => {
            db.set("projectName", "CSC207");
            db.clear();
            expect(db.exists()).toBe(false);
        });

        it("clears in-memory data", () => {
            db.set("projectName", "CSC207");
            db.clear();
            expect(db.get("projectName")).toBeUndefined();
        });

        it("does nothing if no session file exists", () => {
            expect(() => db.clear()).not.toThrow();
        });
    });

    describe("persistence", () => {
        it("persists each set() call to disk immediately", () => {
            db.set("projectName", "CSC207");
            expect(fs.existsSync(SESSION_FILE)).toBe(true);
            const raw = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
            expect(raw.projectName).toBe("CSC207");
        });

        it("survives multiple set() calls", () => {
            db.set("projectName", "CSC207");
            db.set("numUseCases", 20);
            db.set("numViolations", 3);

            const db2 = new SessionDB<SessionData>();
            db2.load();

            expect(db2.get("projectName")).toBe("CSC207");
            expect(db2.get("numUseCases")).toBe(20);
            expect(db2.get("numViolations")).toBe(3);
        });
    });
});