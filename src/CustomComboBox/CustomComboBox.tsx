import React, { useState, useEffect, useRef } from "react";
import { Callout, Stack, CommandButton, DirectionalHint } from "office-ui-fabric-react";

export interface ICustomComboBoxOption {
    key: string,
    text: string
}
export interface ICustomComboBoxProps<T extends ICustomComboBoxOption> {
    uncontrolled?: boolean
    options: T[];
    label?: string;
    placeholder?: string;
    /**
     * If uncontrolled selectedOption is only used as the initial value and then ignored
     * */
    selectedOption?: T | undefined;
    onChange?: (option: T | undefined) => void;
}

interface IBaseState {
    isOptionListOpen: boolean;
    selectInputText?: boolean;
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


class Controller<T extends ICustomComboBoxOption> {
    public constructor(
        public props: ICustomComboBoxProps<T>,
        public state: IState<T>,
        public setState: React.Dispatch<React.SetStateAction<IState<T>>>,
        public inputRef: React.RefObject<HTMLInputElement>) {
    }

    // normally when input gets focus we open the options list
    private scheduleOpenOptionListOnInputFocus: boolean = true;

    public selectInputTextIfScheduled = () => {
        if(this.state.selectInputText) {
            // TODO: Can we avoid the extra render this triggers
            this.setState(s => ({...s, selectInputText:false}));
            this.focusInputAndSelectTextWithoutOpeningOptionList();
        }
    }

    public focusInputAndSelectTextWithoutOpeningOptionList = () => {
        // normally when input gets focus it will open the options list
        // we temprarely disable that function with a flag
        this.scheduleOpenOptionListOnInputFocus = false;

        this.focusInputAndSelectText();

        // set the flag back to normal, so the option list will open the next time the input gets focus
        this.scheduleOpenOptionListOnInputFocus = true;
    }
    
    public doesInputHaveFocus = () => document.activeElement === this.inputRef.current;

    public isControlled = () => !this.props.uncontrolled;

    private focusInputAndSelectText = () => {
        if(this.inputRef.current) {
            // TODO: Not sure if calling focus is needed or if select always moves focus to the input
            // and triggers focus event in all browsers
            if(!this.doesInputHaveFocus()){
                this.inputRef.current.focus();
            }
            this.inputRef.current.select();
        }
    }

    public notifyOfChange = (option: T | undefined) => {
        this.props.onChange && this.props.onChange(option);
    }
    
    public scheduleSelectInputText = () => {
        this.setState(s => ({...s, selectInputText:true}));
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

    public getTextForInput = () =>
        this.state.mode === "search"
            ? this.state.searchText
            : this.getSelectedOption()?.text ?? "";

    public getCurrentOptions = () => {
        const state = this.state;
        const options = this.props.options;

        // if we are searcing then filter the options else return alle the options
        return state.mode === "search"
            ? options.filter(option => option.text.toLocaleLowerCase().indexOf(state.searchText.toLocaleLowerCase()) >= 0)
            : options;
    }

    public getSelectedOption = () => {
        // if we are not in display mode there is no selected option
        if(this.state.mode !== "display") {
            return undefined;
        }
        // if controlled the option given through props is the current one.
        // if uncontrolled the option in the state is the current one
        return this.isControlled() ? this.props.selectedOption : this.state.option;
    }

    public onInputFocus = () => {
        this.focusInputAndSelectText();
        if(this.scheduleOpenOptionListOnInputFocus) {
            this.scheduleOpenOptionList();
        }
    }

    public onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("on input change");
        this.scheduleSearchState(e.target.value);
        // if uncontrolled the state-change will trigger notification on next render
        // if controlled we need to notify that no option is selected
        if(this.isControlled()) {
            this.notifyOfChange(undefined);
        }
    }

    public onOptionListDismiss = () =>  {
        if(this.state.mode !== "display") {
            this.scheduleDisplayState(undefined);
        }
        this.scheduleCloseOptionList();
    }

    public onOptionClick = (option: T) => {
        if(this.isControlled()) {
            // we switch back to displaying the option we currently got
            this.scheduleDisplayState(this.props.selectedOption);
            this.scheduleSelectInputText();
            
            // notify if the option has changed
            if(this.props.selectedOption !== option){
                this.notifyOfChange(option);
            }
            
            // we do not update the state until we actually get the new selected option through the props
            // but we do want to make sure the input element has focus
            // so that the text will be selected when/if we get a new selected option
            this.focusInputAndSelectTextWithoutOpeningOptionList();

        } else {
            // If uncontrolled we need to update the state to display the selcted option
            // and delay notification until the new state is rendered
            this.scheduleDisplayState(option);
            this.scheduleSelectInputText();
        }
    };
}

export const CustomComboBox = function<T extends ICustomComboBoxOption>(props: ICustomComboBoxProps<T>) {
    const [state, setState] = useState<IState<T>>(() => ({
        mode:"display",
        option: props.selectedOption,
        isOptionListOpen: false,
    }));
   
    const controller = new Controller<T>(props, state, setState, useRef<HTMLInputElement>(null));

    // get the option that should be selected
    const selectedOption = controller.getSelectedOption();
    
    // if we are uncontrolled we need to notify when the selected option has changed after it is rendered
    useEffect(() => {
        if(!controller.isControlled()) {
            controller.notifyOfChange(selectedOption);
        }
    }, [selectedOption])
    
    // if we are controlled and get a new selected option from props
    // we need to update the local state, but not if the user is curently searching for another option
    if(controller.isControlled() && state.mode === "display" && state.option != selectedOption) {
        controller.scheduleDisplayState(selectedOption);
        // we only want to select the text if the input already has focus
        // else focus might be stolen from somewhere else and we do not want that
        if(controller.doesInputHaveFocus()) {
            controller.scheduleSelectInputText();
        }
    }
    
    useEffect(controller.selectInputTextIfScheduled);
    
    return (
        <div>
            <Label controller={controller} />
            <Input controller={controller} />
            <OptionsList controller={controller} />
        </div>
    );
}

const Label = function<T extends ICustomComboBoxOption>({controller}: {controller: Controller<T>}) {
    // TODO: set target for label to input
    return controller.props.label ? <label>{controller.props.label}</label> : null;
}

const Input = function<T extends ICustomComboBoxOption>({controller}: {controller: Controller<T>}) {
    return <input
        type="text"
        ref={controller.inputRef}
        value={controller.getTextForInput()}
        onFocus={controller.onInputFocus}
        onInput={controller.onInputChange}
        placeholder={controller.props.placeholder}
        />
}

const OptionsList = function<T extends ICustomComboBoxOption>({controller}: {controller: Controller<T>}) {
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

const Option = function<T extends ICustomComboBoxOption>({controller, option}: {controller: Controller<T>, option: T}) {
    return (<CommandButton onClick={() => controller.onOptionClick(option)}>{option.text}</CommandButton>);
}