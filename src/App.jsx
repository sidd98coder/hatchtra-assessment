import React from "react";
import FileExplorer from "./components/FileExplorer";

const App = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "16px",
        minHeight: "100vh",
        backgroundColor: "#111",
      }}
    >
      <FileExplorer />
    </div>
  );
};

export default App;
