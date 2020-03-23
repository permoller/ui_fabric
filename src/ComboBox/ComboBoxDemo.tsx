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

const filterOptions = (options: IComboBoxOption[], filter: string | undefined) => {
    const f = (filter ?? "").toLocaleLowerCase().trim();
    if (f === "") {
        return options;
    }

    return options.filter(o => o.text.toLocaleLowerCase().indexOf(f) >= 0);
}

export const ComboBoxDemo = () => {
    const [selectedText, setSelectedText] = useState<string | undefined>();
    const [selectedOption, setSelectedOption] = useState<IComboBoxOption | undefined>();
    const [currentText, setCurrentText] = useState<string | undefined>();
    const [currentOption, setCurrentOption] = useState<IComboBoxOption | undefined>();
    const [hasFocus, setHasFocus] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [filterText, setFilterText] = useState<string | undefined>()

    const comboBoxRef = useRef<IComboBox>();
    const ensureMenuIsOpen = () => {
        if (!isMenuOpen) {
            comboBoxRef.current.focus(true);
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
                    return filterOptions(allOptions, filterText);
                }}
                // vi vil ikke have den til automatisk at foreslå resten af teksten... det virker ikke rigtigt
                autoComplete={"off"}
                // vi sætter text eksplicit til den valgte text fra onChange
                text={selectedText ?? ""}
                // vi sætter selectedKey eksplicit til den valgte option fra onChange
                selectedKey={selectedOption?.key ?? null}
                // onChange kaldes når der trykkes enter eller feltet forlades
                onChange={(event, option, index, value) => {
                    log("onChange", { event, option, index, value });
                    setSelectedText(undefined);
                    setSelectedOption(option);
                    setCurrentText(undefined);
                    setCurrentOption(undefined);
                    setFilterText(undefined);
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
                        // hvis menuen er blevet lukket (der er valgt noget fx ved at trykke enter) og der tastes noget igen skal menuen åbnes igen
                        ensureMenuIsOpen();

                        // Vi ønsker kun at opdatere filteret og dermed valgmulighederne hvis der er blevet tastet noget.
                        // Men vi ved reelt ikke om der er tastet noget.

                        // Vi er nødt til at tilgå et privat felt på ComboBox'en for at få fat i Autofill-komponenten som bruges internt til tekstfeltet
                        const autofillRef: React.RefObject<IAutofill | undefined> = (comboBoxRef.current as any)?._autofill;
                        const autofill = autofillRef?.current;
                        // Med Autofill-kompoonenten kan vi se om teksten er markeret eller ej.
                        // Hvis teksten er markeret er det fordi ComboBox'en har sat suggestedDisplayValue til en valgmulighed
                        // og det gør den når man bruger pilene til at markere en valgmulighed i menuen.
                        // Det vil sige vi skal kun opdatere filterText hvis teksten i feltet ikke er markeret
                        console.log("selection", [autofillRef?.current?.selectionEnd, autofillRef?.current?.selectionStart])
                        if (autofill !== undefined && autofill.selectionEnd - autofill.selectionStart < (autofill.value ?? "").length) {
                            // Vi tager teksten direkte fra Autofill-kombonenten.
                            // Vi får ikke altid værdien ind via value og valgmuligheden i option
                            // kan være en som er markeret med musen så den kan vi ikke regne med.
                            setFilterText(autofill.value);
                        }
                    }
                }}
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
                    setSelectedText(undefined);
                    setCurrentText(undefined);
                    setCurrentOption(undefined);
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