import React, { useState } from "react";
import { WithLog } from "../WithLog/WithLog";
import { CustomComboBox } from "./CustomComboBox";

const options = ["red", "green", "blue"].map(s => ({key:s, text:s}));

export const CustomComboBoxDemo = () => {
    const [selectedOption, setSelectedOption] = useState<typeof options[0] | undefined>(undefined);
    return (<>
        <p>Custom ComboBox with search</p>

        <CustomComboBox 
            label="uncontrolled"
            uncontrolled
            options={options}
            placeholder="select a color"
            onChange={(o) => console.log("uncontrolled changed", o)} />
        <br/>

        <CustomComboBox
            label="controlled"
            options={options}
            placeholder="select a color"
            selectedOption={selectedOption}
            onChange={(o) => {
                console.log("controlled changed", o);
                setSelectedOption(o);
            }} />
        <br/>
        <button onClick={() => setTimeout(() => setSelectedOption(options[1]), 2000)}>Set controlled to green after 2 second delay</button>

        <h2>component elements and states</h2>
        <h3>component overall</h3>
        <ul>
            <li>controlled or uncontrolled</li>
            <li>hasFocus or not</li>
            <li>option is selected or not</li>
        </ul>
        <h3>input field</h3>
        <ul>
            <li>empty or has text or shows placholder (empty if not placeholder is provided)</li>
            <li>caret or not (the vertical line that indicates where the letter you type will be inserted)</li>
            <li>when has text
                <ul>
                    <li>text is selected or not</li>
                </ul>
            </li>
            <li></li>
        </ul>
        <h3>options list</h3>
        <ul>
            <li>closed</li>
            <li>open with all options</li>
            <li>open with filtered options</li>
        </ul>
        <h3>option</h3>
        <ul>
            <li>highlighted or not</li>
        </ul>
        <h3>button</h3>
        TODO
        <h2>behaviour</h2>
        <h3>when the component does not have focus</h3>
        <ul>
            <li>if no option is selected
                <ul>
                    <li>options list - closed</li>
                    <li>input field - no caret</li>
                    <li>input field - show placeholder text</li>
                    <li>input field - text is not selected</li>
                </ul>
            </li>
            <li>if option is selected
                <ul>
                    <li>options list - closed</li>
                    <li>input field - no caret</li>
                    <li>input field - show text from selected option</li>
                    <li>input field - text is not selected</li>
                </ul>
            </li>
        </ul>
        <h3>when the component gets focus (both by tabing into field and clicking unfocused field)</h3>
        <ul>
            <li>if no option is selected
                <ul>
                    <li>options list - open with all options</li>
                    <li>input field - show caret</li>
                    <li>input field - show placeholder text</li>
                </ul>
            </li>
            <li>if option is selected
                <ul>
                    <li>options list - open with all options</li>
                    <li>input field - show caret</li>
                    <li>input field - show text from selected option</li>
                    <li>input field - text is selected <span style={{color:"red"}}>does not work when clicking</span></li>
                </ul>
            </li>
        </ul>
        <h3>when the component has focus</h3>
        <ul>
            <li>when user enters (or deletes or pastes) text in input field <span style={{color:"red"}}>the browser clear-button in Edge does not trigger the expected events</span>
                <ul>
                    <li>no option is selected (notify if changed)</li>
                    <li>options list - open with filtered options</li>
                    <li>input field - show caret</li>
                    <li>input field - shows entered text (or placeholder if text was deleted)</li>
                    <li>input field - text is not selected</li>
                </ul>
            </li>
            <li>when user clicks with mouse in input field
                <ul>
                    <li>options list - remains unchanged <span style={{color:"red"}}>should the list open if it was closed?</span></li>
                    <li>input field - caret is posistioned</li>
                    <li>input field - shows entered text</li>
                    <li>input field - part of text is selected if dragging</li>
                </ul>
            </li>
            <li>when mouse-cursor hovers over option
                <ul>
                    <li>options list - remains unchanged</li>
                    <li>input field - remains unchanged</li>
                    <li>the option is highlighted</li>
                </ul>
            </li>
            <li>when user clicks on an option
                <ul>
                    <li>clicked option is selected (notify if changed)</li>
                    <li>options list - closed</li>
                    <li>input field - show text from option</li>
                    <li>input field - text is selected</li>
                </ul>
            </li>
            <li>when arrow-down-key is pressed
                <ul>
                    <li>TODO</li>
                </ul>
            </li>
            <li>when arrow-up-key is pressed
                <ul>
                    <li>TODO</li>
                </ul>
            </li>
            <li>when enter-key is pressed
                <ul>
                    <li>TODO</li>
                </ul>
            </li>
            <li>when tab-key is pressed
                <ul>
                    <li>TODO</li>
                </ul>
            </li>
        </ul>
        <h3>when the component loses focus (both by tabbing and clicking somewhere else)</h3>
        <ul>
            <li>same as when the component does not have focus</li>
        </ul>
        <h3>other</h3>
        <ul>
            <li>When controlled changing selectedOption property does not trigger onChange. It is assumed the controlling component knows about the change.</li>
            <li><span style={{color:"red"}}>when first rendered the uncontrolled component calls onChange... it shuld not do that.</span></li>
        </ul>
    </>);
}