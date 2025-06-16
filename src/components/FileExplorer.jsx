import { useState, useEffect } from "react";
import initialData from "../data/initialData";
import FileNode from "./FileNode";
import { FilePlus, FolderPlus } from "lucide-react";

const flattenVisibleNodes = (nodes, visible = [], level = 0) => {
    for (const node of nodes) {
        visible.push({ ...node, level });
        if (node.children && node.isOpen) {
            flattenVisibleNodes(node.children, visible, level + 1);
        }
    }
    return visible;
};

const FileExplorer = () => {
    const [treeData, setTreeData] = useState(initialData);
    const [selectedId, setSelectedId] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getRootTargetId = () => {
        const firstFolder = treeData.find((node) => node.type === "folder");
        return firstFolder?.id || null;
    };

    const updateNodeById = (nodes, id, updateFn) =>
        nodes.map((node) =>
            node.id === id
                ? updateFn(node)
                : node.children
                    ? { ...node, children: updateNodeById(node.children, id, updateFn) }
                    : node
        );

    const addNodeById = (nodes, id, newNode) =>
        nodes.map((node) =>
            node.id === id
                ? {
                    ...node,
                    isOpen: true,
                    children: [...(node.children || []), newNode],
                }
                : node.children
                    ? { ...node, children: addNodeById(node.children, id, newNode) }
                    : node
        );

    const deleteNodeById = (nodes, id) =>
        nodes
            .map((node) =>
                node.children
                    ? { ...node, children: deleteNodeById(node.children, id) }
                    : node
            )
            .filter((node) => node.id !== id);

    const setNode = (updatedNode) => {
        const newTree = updateNodeById(treeData, updatedNode.id, () => updatedNode);
        setTreeData(newTree);

        if (!updatedNode.isEditing) {
            setAriaMessage(`${updatedNode.type === 'folder' ? 'Folder' : 'File'} renamed to ${updatedNode.name}`);
        }
    };

    const findNodeById = (nodes, id) => {
        for (let node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const result = findNodeById(node.children, id);
                if (result) return result;
            }
        }
        return null;
    };



    const onDelete = (id) => {
        const node = findNodeById(treeData, id);
        const updatedTree = deleteNodeById(treeData, id);
        setTreeData(updatedTree);
        setAriaMessage(`${node?.name || 'Item'} deleted`);
    };

    const onAdd = (parentId, isFolder) => {
        const type = isFolder ? "Folder" : "File";
        const id = Date.now().toString();

        const newNode = {
            id,
            name: "",
            type: isFolder ? "folder" : "file",
            isEditing: true,
            isOpen: isFolder,
            children: isFolder ? [] : undefined,
        };

        const newTree = addNodeById(treeData, parentId, newNode);
        setTreeData(newTree);
        setSelectedId(id);
        setAriaMessage(`${type} created`);
    };


    const [ariaMessage, setAriaMessage] = useState("");

    useEffect(() => {
        const handleKeyDown = (e) => {
            const flat = flattenVisibleNodes(treeData);
            const currentIndex = flat.findIndex((n) => n.id === selectedId);

            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (currentIndex < flat.length - 1) {
                    setSelectedId(flat[currentIndex + 1].id);
                }
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (currentIndex > 0) {
                    setSelectedId(flat[currentIndex - 1].id);
                }
            }

            if (e.key === "Enter") {
                const node = flat[currentIndex];
                if (node?.type === "folder") {
                    setNode({ ...node, isOpen: !node.isOpen });
                }
            }

            if (e.key === "Delete" && selectedId) {
                onDelete(selectedId);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedId, treeData]);

    return (
        <div style={{ display: "flex", height: "100vh", background: "#000" }}>
            <div
                style={{
                    width: isCollapsed ? "60px" : "280px",
                    transition: "width 0.3s",
                    overflow: "hidden",
                    borderRight: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        fontWeight: "bold",
                        marginBottom: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 8px",
                        borderBottom: "1px solid var(--border)",
                    }}
                >
                    {!isCollapsed && <span>Files</span>}
                    <div style={{ display: "flex", gap: "6px" }}>
                        <FilePlus
                            aria-label="Add File"
                            role="button"
                            size={16}
                            color="white"
                            style={{ cursor: "pointer" }}
                            title="Add File"
                            onClick={() => {
                                const parentId = getRootTargetId();
                                if (parentId) onAdd(parentId, false);
                                else alert("No folders available to add file");
                            }}
                        />
                        <FolderPlus
                            size={16}
                            aria-label="Add Folder"
                            role="button"
                            color="white"
                            style={{ cursor: "pointer" }}
                            title="Add Folder"
                            onClick={() => {
                                const parentId = getRootTargetId();
                                if (parentId) onAdd(parentId, true);
                                else alert("No folders available to add folder");
                            }}
                        />
                    </div>
                </div>

                <div
                    aria-live="polite"
                    role="status"
                    style={{
                        position: "absolute",
                        width: "1px",
                        height: "1px",
                        overflow: "hidden",
                        clip: "rect(0 0 0 0)",
                        clipPath: "inset(50%)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {ariaMessage}
                </div>

                <div
                    role="tree"
                    aria-label="File explorer tree"
                    style={{ flexGrow: 1, overflowY: "auto", padding: "4px 8px" }}
                >
                    {treeData.map((node) => (
                        <FileNode
                            key={node.id}
                            node={node}
                            level={0}
                            setNode={setNode}
                            onDelete={onDelete}
                            onAdd={onAdd}
                            setSelectedId={setSelectedId}
                            selectedId={selectedId}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={() => setIsCollapsed((prev) => !prev)}
                style={{
                    background: "#111",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px 12px",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    height: "100%",
                }}
                aria-label="Toggle Sidebar"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? "⯈" : "⯇"}
            </button>

            <div style={{ flex: 1, background: "#111" }} />
        </div>

    );
};

export default FileExplorer;
