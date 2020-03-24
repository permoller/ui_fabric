import React, { useState, useEffect, useRef } from "react";
import { stringify } from "../utils";
import { Callout, Stack, CommandButton, DirectionalHint } from "office-ui-fabric-react";


export interface ICustomComboBoxOption {
    key: string,
    text: string
}
export interface ICustomComboBoxProps<T extends ICustomComboBoxOption> {
    options: T[];
}

interface IBaseState {
    isOptionListOpen: boolean;
    focusInput?: boolean;
}

interface ISearchState extends IBaseState {
    mode: "search",
    searchText: string
}

interface IDisplayState<T extends ICustomComboBoxOption> extends IBaseState {
    mode: "display",
    option: T | undefined;
}

type IState<T extends ICustomComboBoxOption> = ISearchState | IDisplayState<T>;

const log = console.log;

class Controller<T extends ICustomComboBoxOption> {
    public constructor(
        public props: ICustomComboBoxProps<T>,
        public state: IState<T>,
        public setState: React.Dispatch<React.SetStateAction<IState<T>>>,
        public inputRef: React.RefObject<HTMLInputElement>) {
        
    }

    public scheduleOpenOptionListOnFocus: boolean = true;

    public sheduleFocusInput = () => {
        this.setState(s => ({...s, focusInput:true}));
    }

    public componentDidUpdate = () => {
        log("componentDidUpdate", this.state.focusInput, this.inputRef.current);
        if(this.state.focusInput) {
            this.setState(s => ({...s, focusInput:false}));
            this.scheduleOpenOptionListOnFocus = false;
            // det ser ud til at onInputFocus ikke bliver kaldt her når der vælges en option... måske fordi den allerede har fokus
            this.inputRef.current && this.inputRef.current.focus();
            this.scheduleOpenOptionListOnFocus = true;
        }
    }

    public scheduleDisplayState = (option: T | undefined) => {
        this.setState(s => ({mode:"display", isOptionListOpen: false, option}));
    }

    public scheduleSearchState = (searchText: string) => {
        this.setState(s => ({mode:"search", isOptionListOpen: true, searchText}));
    }

    public scheduleOpenOptionList = () => {
        this.setState(s => ({...s, isOptionListOpen: true}));
    }

    public scheduleCloseOptionList = () => {
        this.setState(s => ({...s, isOptionListOpen: false}));
    }

    public getTextForInput = () => this.state.mode === "search" ? this.state.searchText : this.state.option?.text ?? "";

    public getCurrentOptions = () => {
        const state = this.state;
        const options = this.props.options;

        return state.mode !== "search"
            ? options
            : options.filter(option => option.text.toLocaleLowerCase().indexOf(state.searchText.toLocaleLowerCase()) >= 0);
    }
    
    public onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        log("INPUT - onFocus", this.scheduleOpenOptionListOnFocus);
        if(this.scheduleOpenOptionListOnFocus) {
            this.scheduleOpenOptionList();
        }
        this.inputRef.current && this.inputRef.current.select();
    }

    public onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        log("Input - onChange", e.target.value);
        this.scheduleSearchState(e.target.value);
    }

    public onOptionListDismiss = () =>  {
        // log("OptionList - onDismiss");
        if(this.state.mode !== "display"){
            this.scheduleDisplayState(undefined);
        }
        this.scheduleCloseOptionList();
    }

    public onOptionClick = (option: T) => {
        log("Option - onClick", stringify(option));
        this.scheduleDisplayState(option);
        this.sheduleFocusInput();
    };
}

export const CustomComboBox = function<T extends ICustomComboBoxOption>(props: ICustomComboBoxProps<T>) {
    const [state, setState] = useState<IState<T>>(() => ({
        mode:"display",
        option: undefined,
        isOptionListOpen: false
    }));
    
    log("CustomComboBox - render", stringify(state));

    const controller = new Controller<T>(props, state, setState, useRef<HTMLInputElement>(null));
    useEffect(() => {
        controller.componentDidUpdate();
    });

    return (
        <div>
            <Input {...controller} />
            <OptionsList {...controller} />
        </div>
    );
}

const Input = function<T extends ICustomComboBoxOption>(controller: Controller<T>) {
    return <input
        ref={controller.inputRef}
        value={controller.getTextForInput()}
        onFocus={controller.onInputFocus}
        onChange={controller.onInputChange}
        onBlur={() => log("Input - onBlur")}
        />
}

const OptionsList = function<T extends ICustomComboBoxOption>(controller: Controller<T>) {
    log("OptionList - render", controller.state.isOptionListOpen)
    if(!controller.state.isOptionListOpen) {
        return null;
    }

    return (
        <Callout
            // open list at the input-field
            target={controller.inputRef}
            // break is an "arrow" that points to the input-field... we don't want that
            isBeakVisible={false}
            // no space between the input-field and the list
            gapSpace={0}
            // place the list at the lower left corner of the input field
            directionalHint={DirectionalHint.bottomLeftEdge}
            // if where is no room to display the list it may be displayed at another location
            directionalHintFixed={false}
            // when the user clicks outside of the list and the input-field or presses escape
            onDismiss={controller.onOptionListDismiss}>
            <Stack>
                {controller.getCurrentOptions().map(o => <Option key={o.key} controller={controller} option={o} />)}
            </Stack>
        </Callout>
    );
}

const Option = function<T extends ICustomComboBoxOption>(props: {controller: Controller<T>, option: T}) {
    const {controller, option} = props;
    
    return (<CommandButton onClick={() => controller.onOptionClick(option)}>{option.text}</CommandButton>);
}