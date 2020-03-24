import React, { useState } from "react";
import { PrimaryButton } from "office-ui-fabric-react";

export const Expandable: React.FC<{ title: string }> = (props) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div style={{ margin: "20px" }}>
            <PrimaryButton onClick={() => setExpanded((previous) => !previous)}>{props.title}</PrimaryButton>
            {expanded && props.children}
        </div>
    )

}