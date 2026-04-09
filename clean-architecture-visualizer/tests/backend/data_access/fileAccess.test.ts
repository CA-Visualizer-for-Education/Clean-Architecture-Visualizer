import { jest } from "@jest/globals";
import { describe, it, expect, beforeEach, afterEach} from '@jest/globals';
import type { Dirent } from "fs";

type ReaddirFn = (
    path: string,
    options?: { withFileTypes?: boolean }
) => Promise<Dirent[]>;

const mockReaddir = jest.fn() as jest.MockedFunction<ReaddirFn>;
const mockReadFile = jest.fn() as jest.MockedFunction<(path: string, options: { encoding: string }) => Promise<string>>;

jest.unstable_mockModule("fs/promises", () => ({
    readdir: mockReaddir,
    readFile: mockReadFile,
    default: {
        readdir: mockReaddir,
        readFile: mockReadFile,
    },
}));

const { FileAccess } = await import(
    "../../../src/data_access/fileAccess.js"
);

// Helper to create fake directory entries
function mockDir(name: string): Dirent {
    return { name, isDirectory: () => true } as Dirent;
}

function mockFile(name: string): Dirent {
    return { name, isDirectory: () => false } as Dirent;
}

describe("bfsFindDir functionality", () => {
    const fileAccess = new FileAccess();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns the src directory when it exists at the top level", async () => {
        mockReaddir.mockResolvedValueOnce([mockDir("src"), mockDir("tests")] as any);

        const result = await fileAccess.bfsFindDir("/project", "src");
        expect(result).toBe("/project/src");
    });

    it("finds src nested one level deep", async () => {
        mockReaddir
            .mockResolvedValueOnce([mockDir("packages")] as any)
            .mockResolvedValueOnce([mockDir("src")] as any);

        const result = await fileAccess.bfsFindDir("/project", "src");
        expect(result).toBe("/project/packages/src");
    });

    it("returns null when no src directory exists", async () => {
        mockReaddir
            .mockResolvedValueOnce([mockDir("tests"), mockDir("dist")] as any)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const result = await fileAccess.bfsFindDir("/project", "src");
        expect(result).toBeNull();
    });

    it("ignores files and only traverses directories", async () => {
        mockReaddir.mockResolvedValueOnce([
            mockFile("index.ts"),
            mockFile("package.json"),
            mockDir("src"),
        ] as any);

        const result = await fileAccess.bfsFindDir("/project", "src");
        expect(result).toBe("/project/src");
    });

    it("returns null for an empty directory", async () => {
        mockReaddir.mockResolvedValueOnce([]);

        const result = await fileAccess.bfsFindDir("/project", "src");
        expect(result).toBeNull();
    });

    it("finds src at the starting directory itself", async () => {
        mockReaddir.mockResolvedValueOnce([mockDir("src")] as any);

        const result = await fileAccess.bfsFindDir("/project", "src");
        expect(result).toBe("/project/src");
    });
});

describe("getFileImports functionality", () => {
    const fileAccess = new FileAccess();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns an empty array for a file with no imports", async () => {
        mockReadFile.mockResolvedValueOnce("const x = 1;\nconsole.log(x);" as any);

        const result = await fileAccess.getFileImports("/project/index.ts");
        expect(result).toEqual([]);
    });

    it("returns a single import", async () => {
        mockReadFile.mockResolvedValueOnce("import fs from \"fs/promises\";" as any);

        const result = await fileAccess.getFileImports("/project/index.ts");
        expect(result).toEqual(["\"fs/promises\";"]);
    });

    it("returns multiple imports", async () => {
        mockReadFile.mockResolvedValueOnce(
            "import fs from \"fs/promises\";\nimport path from \"path\";\nconst x = 1;" as any
        );

        const result = await fileAccess.getFileImports("/project/index.ts");
        expect(result).toEqual(["\"fs/promises\";", "\"path\";"]);
    });

    it("returns an empty array and logs when the file is not found", async () => {
        mockReadFile.mockRejectedValueOnce(new Error("File not found") as any);
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        const result = await fileAccess.getFileImports("/project/missing.ts");
        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith("The file: /project/missing.ts could not be found");
    });

    it("ignores lines that do not start with import", async () => {
        mockReadFile.mockResolvedValueOnce(
            "// import fake from \"fake\";\nconst x = 1;\nimport real from \"real\";" as any
        );

        const result = await fileAccess.getFileImports("/project/index.ts");
        expect(result).toEqual(["\"real\";"]);
    });
});