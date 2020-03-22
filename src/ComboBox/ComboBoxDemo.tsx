import React, { useState, useRef, CSSProperties } from "react";
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


const filteredKeyDelimiterString = "____"

const isOptionWithMatchInformation = (option: IComboBoxOption) => typeof option.key === "string" && option.key.indexOf(filteredKeyDelimiterString) >= 0;

const getStartAndEndOfMatch = (option: IComboBoxOption) => {
    const keySegments = option.key.toString().split(filteredKeyDelimiterString, 3);
    const matchStart = parseInt(keySegments[0]);
    const matchEnd = parseInt(keySegments[1]);
    return [matchStart, matchEnd];
}
const mapToOptionWithMatchInformation = (option: IComboBoxOption, filter: string) => {
    if (isOptionWithMatchInformation(option)) {
        return mapToOptionWithMatchInformation(option.data, filter);
    }
    const text = option.text;
    const matchStart = text.toLocaleLowerCase().indexOf(filter);
    if (matchStart >= 0) {
        const matchEnd = matchStart + filter.length;
        const newKey = matchStart + filteredKeyDelimiterString + matchEnd + filteredKeyDelimiterString + option.key;
        return { ...option, key: newKey, data: option };
    }
    return undefined;
}

const filterOptions = (options: IComboBoxOption[], filter: string) => {
    if (filter === undefined) {
        return options;
    }
    return options
        .map(o => mapToOptionWithMatchInformation(o, filter))
        .filter(o => o !== undefined);
}

const onRenderOptionWithMatchHeighlight = (option: ISelectableOption) => {
    const text = option.text;
    if (isOptionWithMatchInformation(option)) {
        const [matchStart, matchEnd] = getStartAndEndOfMatch(option);

        const textBeforeMatch = matchStart === 0 ? undefined : text.substring(0, matchStart);
        const textThatMatches = text.substring(matchStart, matchEnd);
        const textAfterMatch = matchEnd < text.length ? text.substring(matchEnd) : undefined;

        return (<>
            {textBeforeMatch ?? <span>{textBeforeMatch}</span>}
            <span style={{ fontWeight: "bold" }}>{textThatMatches}</span>
            {textAfterMatch ?? <span>{textAfterMatch}</span>}
        </>);

    }
    return <span>{option.text}</span>

}

export const ComboBoxDemo = () => {
    const [selectedText, setSelectedText] = useState<string | undefined>();
    const [selectedOption, setSelectedOption] = useState<IComboBoxOption | undefined>();
    const [currentText, setCurrentText] = useState<string | undefined>();
    const [currentOption, setCurrentOption] = useState<IComboBoxOption | undefined>();
    const [hasFocus, setHasFocus] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [filterText, setFilterTextWithoutNormalizingIt] = useState<string | undefined>()

    const comboBoxRef = useRef<IComboBox>();
    const ensureMenuIsOpen = () => {
        if (!isMenuOpen) {
            comboBoxRef.current.focus(true);
        }
    }

    const setFilterText = (newFilterText: string | undefined) => {
        const lowercaseAndTrimmed = newFilterText?.toLocaleLowerCase()?.trim();
        const newText = lowercaseAndTrimmed === "" ? undefined : lowercaseAndTrimmed;
        if (filterText !== newText) {
            setFilterTextWithoutNormalizingIt(newFilterText);
        }
    }


    return (<WithLog>{(log) =>
        <>
            <ComboBox
                label="ComboBox med søgning til valg af ét element"
                componentRef={comboBoxRef}
                // tillad at der indtastes vilkårlig tekst... ikke kun gyldige options
                allowFreeform
                // options her, da de ikke vises hvis de kun returneres fra onResolveOptions
                options={filterOptions(allOptions, filterText)}
                // onResolveOptions bliver kaldt bl.a. når listen af valgmuligheder skal vises for at hente de aktuelle options
                // TODO: jeg ved ikke helt om det er nødvendigt at angive denne funktion for at få filtrering eller om det er nok at sætte options
                onResolveOptions={(options) => {
                    log("onResolveOptions", options);
                    return filterOptions(options, filterText);
                }}
                // vi vil ikke have den til automatisk at foreslå resten af teksten... det virker kun når man skriver starten af en valgmulighed
                autoComplete={"off"}
                // vi sætter text eksplicit til den valgte text fra onChange
                text={currentText}
                // vi sætter selectedKey eksplicit til den valgte option fra onChange
                selectedKey={currentOption?.key}
                // onChange kaldes når der trykkes enter eller feltet forlades
                onChange={(event, option, index, value) => {
                    log("onChange", { event, option, index, value });
                    setSelectedText(value);
                    setSelectedOption(option);
                    setCurrentText(value);
                    setCurrentOption(option);
                    if (option) {
                        // der er valgt noget så vi nulstiller søgeteksten så alle valgmuligheder vises hvis menuen med valgmuligheder åbnes
                        setFilterText(undefined);
                    } else {
                        setFilterText(value);
                    }
                }}
                // onPendingValueChanged kaldes på mange tidspunkter...
                // Hvis der tastes i feltet og teksten ikke er magen til teksten fra en af valgmulighederne gives den tastede tekst med i value og option er undefined.
                // Hvis der tastes i feltet og teksten er magen til teksten fra en af valgmulighederne gives valgmuligheden med i option og value er undefined.
                // Hvis en valgmulighed markeres med piletasterne eller med musen kaldes metoden med valgmuligheden i option og value er undefined.
                // Metoden kaldes også på andre tidspunkter hvor value og option er undefined.
                onPendingValueChanged={(option, index, value) => {
                    log("onPendingValueChanged", { option, index, value });
                    if (option !== undefined || value !== undefined) {
                        setCurrentText(value);
                        setCurrentOption(option);

                        if (value !== undefined) {
                            // hvis der er tastet noget og det ikke er magen til en af valgmulighederne
                            // får vi den tastede tekst i value og kan bruge den til at filtrere med.
                            setFilterText(value);
                        } else {
                            // Hvis vi har fået en valgmulighed ved vi ikke om det er fordi der er tastet noget,
                            // som er magen til en valgmulighed, eller om det er fordi
                            // en valgmulighed er markeret med piletasterne eller musen.
                            // Så vi ved ikke om filterText skal opdateres eller ej!!!

                            // Vi er nødt til at tilgå et privat felt på ComboBox'en for at få fat i Autofill-komponenten som bruges internt til tekstfeltet
                            const autofillRef: React.RefObject<IAutofill | undefined> = (comboBoxRef.current as any)?._autofill;
                            // Med Autofill-kompoonenten kan vi se om teksten er markeret eller ej.
                            // Hvis teksten er markeret er det fordi ComboBox'en har sat suggestedDisplayValue til en valgmulighed
                            // og det gør den når man bruger pilene til at markere en valgmulighed i menuen.
                            // Det vil sige vi skal kun opdatere filterText hvis teksten i feltet ikke er markeret
                            if (!autofillRef?.current?.isValueSelected) {
                                // Vi tager teksten direkte fra Autofill-kombonenten.
                                // Vi får ikke værdien ind via value og valgmuligheden i option
                                // kan være en som er markeret med musen så den kan vi ikke regne med.
                                console.log(autofillRef?.current);
                                const v = autofillRef?.current?.value;
                                if (v !== undefined) {
                                    setFilterText(v);
                                }
                            }
                        }
                        // hvis menuen er blevet lukket (der er valgt noget fx ved at trykke enter) og der tastes noget igen skal menuen åbnes igen
                        ensureMenuIsOpen();
                    }
                }
                }
                onFocus={(e) => {
                    log("onFocus", e);
                    setHasFocus(true);
                    // når allowFreeform er slået til åbnes menuen med valgmuligheder ikke automatisk når feltet får fokus..
                    // det kan vi gøre med følgende linje
                    // ensureMenuIsOpen();
                }}
                onBlur={(e) => {
                    log("onBlur", e);
                    setHasFocus(false);
                    setCurrentText(undefined);
                    setFilterText(undefined);
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
                onRenderOption={onRenderOptionWithMatchHeighlight}
            />
            <p>
                current text: {currentText}<br />
                current option: {stringify(currentOption)}<br />
                selected text: {selectedText}<br />
                selected option: {stringify(selectedOption)}<br />
                filter text: {filterText}<br />
                has focus: {stringify(hasFocus)}<br />
                is menu open: {stringify(isMenuOpen)}<br />

            </p>
        </>
    }</WithLog>);
}