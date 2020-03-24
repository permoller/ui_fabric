import React from "react";
import { WithLog } from "../WithLog/WithLog";
import { CustomComboBox } from "./CustomComboBox";

const options = ["red", "green", "blue"].map(s => ({key:s, text:s}));

export const CustomComboBoxDemo = () => {
return <WithLog>{(log) => {
    return (<>
    <p>Custom ComboBox med søgning</p>
    <CustomComboBox options={options} /></>);
}}</WithLog>;
}