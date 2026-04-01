import type { cleanLayer } from "./cleanLayer.js"

export type FileTreeNode = {
    id: string
    name: string
    type: "directory" | "file"
    path: string
    layer?: cleanLayer
    hasViolation?: boolean
    children?: FileTreeNode[]
}
