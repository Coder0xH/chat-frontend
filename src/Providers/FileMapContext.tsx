import { createContext, useContext } from 'react';

type FileMapContextType = Map<string, { filepath: string, filename: string, size: number, type: string }>;

// 创建一个带有默认值的空Map作为文件映射
const defaultFileMap = new Map<string, { filepath: string, filename: string, size: number, type: string }>();

export const FileMapContext = createContext<FileMapContextType>(defaultFileMap);
export const useFileMapContext = () => useContext(FileMapContext);
