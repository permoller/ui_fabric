
import React, { useState } from "react";
import { IconButton } from "office-ui-fabric-react";
import { stringify } from "../utils";

export const WithLog = (props: { children: (log: (message: string, data?: any) => void) => React.ReactNode }) => {
    const [logLines, setLogLines] = useState<string[]>([]);
    const appendLineToLog = (line: string) => setLogLines((prevLines) => [...prevLines, line]);
    const log = (message: string, data?: any) => { appendLineToLog(message + (data !== undefined && data != null ? (" " + stringify(data)) : "")); console.log(message, data); }

    return (
        <>
            {props.children(log)}
            <div>
                <span>Log:</span><IconButton onClick={() => setLogLines([])} iconProps={{ iconName: "Delete" }} />
                <div style={{ height: "300px", width: "100%", overflowX: "scroll", overflowY: "scroll" }}>
                    {logLines.map(l => <div style={{ whiteSpace: "nowrap" }}>{l}</div>)}
                </div>
            </div>
        </>
    )
}