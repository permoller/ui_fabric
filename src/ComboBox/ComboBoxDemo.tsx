import React, { useState, useRef } from "react";
import { ComboBox, IComboBoxOption, IComboBox, optionProperties, IAutofill, ISelectableOption } from "office-ui-fabric-react";
import { WithLog } from "../WithLog/WithLog";
import { stringify } from "../utils";

const allOptions: IComboBoxOption[] = [
    { key: "red", text: "Red" },
    { key: "blue", text: "Blue" },
    { key: "green", text: "Green" },
    { key: "orange", text: "Orange" },
    { key: "black", text: "Black" },
    { key: "white", text: "White" },
    { key: "yellow", text: "Yellow" },
    { key: "red2", text: "Red2" },
    { key: "red3", text: "Red3" }
]

const filterOptions = (options: IComboBoxOption[], filter: string | undefined) => {
    const f = (filter ?? "").toLocaleLowerCase().trim();
    if (f === "") {
        return options;
    }

    return options.filter(o => o.text.toLocaleLowerCase().indexOf(f) >= 0);
}
interface IState {
    selectedText: string | undefined,
    selectedOption: IComboBoxOption | undefined,
    currentText: string | undefined,
    currentOption: IComboBoxOption | undefined,
}

const cleanState: IState = {
    selectedOption: undefined,
    selectedText: undefined,
    currentOption: undefined,
    currentText: undefined
}

interface IFilterState {
    filterText: string | undefined,
    filteredOptions: IComboBoxOption[],
    isFiltering: boolean
}
export const ComboBoxDemo = () => {
    const [state, setState] = useState<IState>(cleanState);
    const [filterState, setFilterState] = useState<IFilterState>({filteredOptions:allOptions, filterText:undefined, isFiltering:false});
    const [hasFocus, setHasFocus] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const comboBoxRef = useRef<IComboBox>();
    const ensureMenuIsOpen = () => {
        if (!isMenuOpen) {
            comboBoxRef.current.focus(true);
        }
    }

    const updateFilterState = (newFilterText: string | undefined) => {
        const f = newFilterText?.toLocaleLowerCase()?.trim() || undefined;
    
        if(filterState.filterText !== f) {
            setFilterState({
                filterText: f,
                filteredOptions: f === undefined ? allOptions : filterOptions(allOptions, f),
                isFiltering: f !== undefined
            })
        }
    }

    return (<WithLog>{(log) =>
        <>
            <p>
                current option: {stringify(state.currentOption)}<br />
                selected text: {state.selectedText}<br />
                selected option: {stringify(state.selectedOption)}<br />
                filter text: {filterState.filterText}<br />
                is filtering: {stringify(filterState.isFiltering)}<br/>
                has focus: {stringify(hasFocus)}<br />
                is menu open: {stringify(isMenuOpen)}<br />
            </p>
            <ComboBox
                label="ComboBox med søgning til valg af ét element"
                componentRef={comboBoxRef}
                // tillad at der indtastes vilkårlig tekst... ikke kun gyldige options
                allowFreeform
                // options her, da de ikke vises hvis de kun returneres fra onResolveOptions
                options={filterState.filteredOptions}
                // onResolveOptions bliver kaldt bl.a. når listen af valgmuligheder skal vises for at hente de aktuelle options
                // TODO: jeg ved ikke helt om det er nødvendigt at angive denne funktion for at få filtrering eller om det er nok at sætte options
                onResolveOptions={(options) => {
                    log("onResolveOptions", options);
                    return filterState.filteredOptions;
                }}
                // vi vil ikke have den til automatisk at foreslå resten af teksten... det virker ikke rigtigt
                autoComplete={"off"}
                // vi sætter text eksplicit til den valgte text fra onChange
                text={state.selectedText ?? ""}
                // vi sætter selectedKey eksplicit til den valgte option fra onChange
                selectedKey={state.selectedOption?.key ?? null}
                // onChange kaldes når der trykkes enter eller feltet forlades
                onChange={(event, option, index, value) => {
                    log("onChange", { event, option, index, value });
                    setState({
                        ...cleanState,
                        selectedOption:option
                    });
                    updateFilterState(undefined);
                }}
                // onPendingValueChanged kaldes på mange tidspunkter...
                // Hvis der tastes i feltet og teksten ikke er magen til teksten fra en af valgmulighederne gives den tastede tekst med i value og option er undefined.
                // Hvis der tastes i feltet og teksten er magen til teksten fra en af valgmulighederne gives valgmuligheden med i option og value er undefined.
                // Hvis en valgmulighed markeres med piletasterne eller med musen kaldes metoden med valgmuligheden i option og value er undefined.
                // Metoden kaldes også på andre tidspunkter hvor value og option er undefined.
                onPendingValueChanged={(option, index, value) => {
                    log("onPendingValueChanged", { option, index, value });
                    // ignorer kald hvor der ikke er givet en tekst eller en valgmulighed med
                    if(option === undefined && value === undefined) {
                        return;
                    }
                    let newText = undefined;

                    // Vi ønsker kun at opdatere filteret og dermed valgmulighederne hvis der er blevet tastet noget.
                    // Men vi ved reelt ikke om der er tastet noget.
                    if(value !== undefined) {
                        // Hvis value er sat ved vi at der er tastet noget
                        newText = value;

                        
                    } else {
                        // hvis vi ikke allerede er i gang med at filtrere begynder vi ikke på det før vi ved at der er tastet noget
                        // i praksis betyder det at hvis der er en valgmulighed på ét bogstav og dette bogstav tastes filtrerer vi ikke valgmulighederne
                        if(filterState.isFiltering) {
                            // Hvis value ikke er sat forsøger vi at tage værdien fra den Autofill-komponent som er inden i ComboBox.
                            // Vi er nødt til at tilgå et privat felt på ComboBox'en for at få fat i Autofill-komponenten.
                            const autofillRef: React.RefObject<IAutofill | undefined> = (comboBoxRef.current as any)?._autofill;
                            const autofill = autofillRef?.current;
                    
                            // hvis værdien er markeret kan der ikke være tastet noget
                            //  så vi tager kun værdien hvis den ikke er markeret
                            if(!autofill?.isValueSelected) {
                                newText = autofill.value;
                            }
                        }
                    }

                    if(newText !== undefined) {
                        
                        // hvis menuen er blevet lukket (der er valgt noget fx ved at trykke enter)
                        // og der tastes noget igen skal menuen åbnes igen
                        ensureMenuIsOpen();
                        setState({
                            ...cleanState,
                            currentText: newText,
                            currentOption: option
                        });
                        updateFilterState(newText);
                    } else {
                        setState(s => ({
                            ...s,
                            currentText: value,
                            currentOption: option
                        }));
                    }   
                }}
                onFocus={(e) => {
                    log("onFocus", e);
                    setHasFocus(true);
                    // når allowFreeform er slået til åbnes menuen med valgmuligheder ikke automatisk når feltet får fokus..
                    // det kan vi gøre med følgende linje, men af en eller anden grund virker det så ikke at åbne menuen ved klik
                    // på knappen til at åbne menuen
                    //ensureMenuIsOpen();
                }}
                onBlur={(e) => {
                    log("onBlur", e);
                    setHasFocus(false);
                    setState(s => ({...cleanState, selectedOption: s.selectedOption}));
                    updateFilterState(undefined);
                }}
                onMenuOpen={() => {
                    log("onMenuOpen");
                    setIsMenuOpen(true);
                }}
                onMenuDismiss={() => log("onMenuDismiss")}
                onMenuDismissed={() => {
                    log("onMenuDismissed");
                    setIsMenuOpen(false);
                }}
            />
        </>
    }</WithLog>);
}