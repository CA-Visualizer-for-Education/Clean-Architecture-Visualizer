import { jest } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';

// A FileAccess double with every method mocked and typed; tests stub only the
// methods they use.
export function makeMockFileAccess(): jest.Mocked<FileAccessInterface> {
  return {
    getUseCases: jest.fn<FileAccessInterface['getUseCases']>(),
    getFilePaths: jest.fn<FileAccessInterface['getFilePaths']>(),
    getFileImports: jest.fn<FileAccessInterface['getFileImports']>(),
    getProjectName: jest.fn<FileAccessInterface['getProjectName']>(),
    getFileContent: jest.fn<FileAccessInterface['getFileContent']>(),
    getFileSnippet: jest.fn<FileAccessInterface['getFileSnippet']>(),
    getLineNumber: jest.fn<FileAccessInterface['getLineNumber']>(),
    createDirectory: jest.fn<FileAccessInterface['createDirectory']>(),
    getCurrentPath: jest.fn<FileAccessInterface['getCurrentPath']>(),
    bfsFindDir: jest.fn<FileAccessInterface['bfsFindDir']>(),
    exists: jest.fn<FileAccessInterface['exists']>(),
    createFile: jest.fn<FileAccessInterface['createFile']>(),
  };
}
