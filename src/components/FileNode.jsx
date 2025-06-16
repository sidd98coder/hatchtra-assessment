import React, { useState, useEffect, useRef } from "react";
import {
    Folder,
    FolderOpen,
    File as FileIcon,
    Pencil,
    Trash2,
    Plus,
    FolderArchive,
} from "lucide-react";

const FileNode = ({
    node,
    level,
    setNode,
    onDelete,
    onAdd,
    setSelectedId,
    selectedId,
}) => {
    const [isEditing, setIsEditing] = useState(node.isEditing || false);
    const [name, setName] = useState(node.name || "");
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef(null);
    const isSelected = selectedId === node.id;

    useEffect(() => {
        if (node.isEditing) setIsEditing(true);
    }, [node.isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleToggle = (e) => {
        e.stopPropagation();
        if (node.type === "folder") {
            setNode({ ...node, isOpen: !node.isOpen });
        }
    };

    const handleRename = () => {
        if (!name.trim()) {
            alert("Name cannot be empty.");
            return;
        }
        setIsEditing(false);
        setNode({ ...node, name, isEditing: false });
    };

    const handleBlur = () => {
        if (!name.trim()) {
            onDelete(node.id);
        } else {
            handleRename();
        }
    };

    const onSelect = (e) => {
        e.stopPropagation();
        setSelectedId(node.id);
    };

    return (
        <>
            {/* Parent Node */}
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onSelect}
                style={{
                    padding: "4px 6px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "4px",
                    backgroundColor: isHovered ? "#1e1e1e" : "transparent",
                    color: isHovered ? "#00b0ff" : "white",
                    fontWeight: node.type === "folder" ? "bold" : "normal",
                    cursor: "pointer",
                    marginLeft: `${level * 16}px`,
                }}
            >
                {/* Icon */}
                <div
                    role="treeitem"
                    aria-expanded={node.type === "folder" ? node.isOpen : undefined}
                    aria-label={`${node.name} ${node.type}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && node.type === "folder") {
                            setNode({ ...node, isOpen: !node.isOpen });
                        }
                        if (e.key === "Delete") {
                            onDelete(node.id);
                        }
                    }}
                    onFocus={() => setSelectedId(node.id)}
                    onClick={(e) => {
                        onSelect(e);
                        if (node.type === "folder") {
                            setNode({ ...node, isOpen: !node.isOpen });
                        }
                    }}
                >
                    {node.type === "folder"
                        ? node.isOpen
                            ? <FolderOpen size={16} style={{ marginRight: "6px" }} />
                            : <Folder size={16} style={{ marginRight: "6px" }} />
                        : <FileIcon size={16} style={{ marginRight: "6px" }} />}
                </div>

                {/* Input or Text */}
                {isEditing ? (
                    <input
                        ref={inputRef}
                        aria-label={`Rename ${node.name}`}
                        role="textbox"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleRename();
                            }
                        }}
                        style={{
                            flex: 1,
                            fontSize: "14px",
                            padding: "2px 4px",
                            borderRadius: "2px",
                            border: "1px solid #555",
                            background: "#222",
                            color: "white",
                        }}
                    />
                ) : (
                    <span style={{ flex: 1 }}>{node.name}</span>
                )}

                {/* Controls */}
                {isHovered && !isEditing && (
                    <div style={{ display: "flex", gap: "4px" }}>
                        <span title="Rename" aria-label={`Rename ${node.name}`} role="button">
                            <Pencil
                                size={14}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            />
                        </span>

                        <span title="Delete" aria-label={`Delete ${node.name}`} role="button">
                            <Trash2
                                size={14}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(node.id);
                                }}
                                style={{ cursor: "pointer" }}
                            />
                        </span>
                        {node.type === "folder" && (
                            <>
                                <span title="Add Folder" aria-label={`Add folder to ${node.name}`} role="button">
                                    <Folder
                                        size={14}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAdd(node.id, true);
                                        }}
                                        style={{ cursor: "pointer" }}
                                    />
                                </span>
                                <span title="Add File" aria-label={`Add file to ${node.name}`} role="button">
                                    <FileIcon
                                        size={14}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAdd(node.id, false);
                                        }}
                                        style={{ cursor: "pointer" }}
                                    />
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Children */}
            <div role="group">
                {node.children && node.isOpen && (
                    <div>
                        {node.children.map((child) => (
                            <FileNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                setNode={setNode}
                                onDelete={onDelete}
                                onAdd={onAdd}
                                setSelectedId={setSelectedId}
                                selectedId={selectedId}
                            />
                        ))}
                    </div>
                )}
            </div>

        </>
    );
};

export default FileNode;
