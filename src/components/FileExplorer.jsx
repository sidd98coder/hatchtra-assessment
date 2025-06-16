import { useState } from "react";
import initialData from "../data/initialData";
import FileNode from "./FileNode";
import { FilePlus, FolderPlus } from "lucide-react";

const FileExplorer = () => {
    const [treeData, setTreeData] = useState(initialData);
    const [selectedId, setSelectedId] = useState(null);

    const getRootTargetId = () => {
        // Use first folder in the tree
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
        const newNode = {
            id: Date.now().toString(),
            name: "",
            type: isFolder ? "folder" : "file",
            isEditing: true,
            isOpen: true,
            children: isFolder ? [] : undefined,
        };
        const newTree = addNodeById(treeData, parentId, newNode);
        setTreeData(newTree);
        setAriaMessage(`${type} created`);
    };


    const [ariaMessage, setAriaMessage] = useState("");

    return (
        <div
            style={{
                maxWidth: "100%",
                width: "100%",
                height: "100vh",
                overflow: "auto",
                background: "#000",
                padding: "12px",
                boxSizing: "border-box",
                border: "1px solid var(--border)",
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
                <span>Files</span>
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



            <div role="tree" aria-label="File explorer tree">
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
                    />
                ))}
            </div>

        </div>
    );
};

export default FileExplorer;
