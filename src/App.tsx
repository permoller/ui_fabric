import React, { useState } from "react";
import { initializeIcons } from '@uifabric/icons';
import { PrimaryButton } from "office-ui-fabric-react";
import { TagPickerWithRefreshDemo } from "./TagPickerWithRefresh/TagPickerWithRefreshDemo";
import { AutofillDemo } from "./Autofill/AutofillDemo";

// needed for icons used by UI Fabric components to work
initializeIcons();

const Expandable: React.FC<{ title: string }> = (props) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div style={{ margin: "20px" }}>
            <PrimaryButton onClick={() => setExpanded((previous) => !previous)}>{props.title}</PrimaryButton>
            {expanded && props.children}
        </div>
    )

}
export const App = () => {

    return (
        <>
            <div>React app with typescript build with webpack for playing with UI Fabric</div>

            <Expandable title="Demo af TagPicker som kan opdatere listen af valgmuligheder mens den er åben"><TagPickerWithRefreshDemo /></Expandable>
            <Expandable title="Autofill - test af hvordan den bruges"><AutofillDemo /></Expandable>
        </>)
};