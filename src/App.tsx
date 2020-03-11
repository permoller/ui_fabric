import React from "react";
import { initializeIcons } from '@uifabric/icons';
import { PrimaryButton } from "office-ui-fabric-react";
import { TagPickerWithRefreshDemo } from "./TagPickerWithRefresh/TagPickerWithRefreshDemo";

// needed for icons used by UI Fabric components to work
initializeIcons();

export const App = () => {

    return (
        <>
            <div>React app with typescript build with webpack and included UI Fabric</div>
            <PrimaryButton>UI Fabric Primary button</PrimaryButton>
            <TagPickerWithRefreshDemo />
        </>)
};