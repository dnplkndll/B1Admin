import { useState, type ReactNode } from "react";
import { Tooltip } from "@mui/material";

const CopyableText = ({ text, children }: { text: string; children: ReactNode }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Tooltip title={copied ? "Copied!" : "Click to copy"}>
            <span
                onClick={handleCopy}
                style={{
                    cursor: "pointer",
                    borderRadius: "4px",
                    padding: "2px 4px",
                    margin: "-2px -4px",
                    transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
                {children}
            </span>
        </Tooltip>
    );
};

export default CopyableText