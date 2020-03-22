import React, { useState } from "react";
import { Autofill } from "office-ui-fabric-react";

const suggestions = ["red", "blue", "green", "orange", "yellow", "brown", "black", "white", "cyan", "pink", "magenta"];

export const AutofillDemo = () => {

    const [writtenValue, setWrittenValue] = useState<string>();
    const [displayedValue, setDisplayedValue] = useState<string>();
    const [suggestedValue, setSuggestedValue] = useState<string>();
    const [focused, setFocused] = useState(false);
    const [logLines, setLogLines] = useState<string[]>([]);
    const appendLineToLog = (line: string) => setLogLines((prevLines) => [...prevLines, line]);
    const tryStringify = (obj: any) => { try { return JSON.stringify(obj); } catch { return ""; } }
    const log = (message: string, data: any) => { appendLineToLog(message + " " + tryStringify(data)); console.log(message, data); }

    return (
        <>
            <p>Tekst-felt hvor der er et autoamtisk forslag til resten af ordet.</p>
            <p>Ord som der automatisk kommer forslag til: {suggestions.reduce((prev, current) => prev + ", " + current)}</p>
            <Autofill
                onFocus={(e) => { log("onFocus", e); setFocused(true); }}
                onBlur={(e) => { log("onBlur", e); setFocused(false); setDisplayedValue(e.target.value); }}
                // hvis suggestedDisplayValue starter med den tekst som er skrevet i feltet vises resten af suggestedDisplayValue også i feltet og er markeret
                suggestedDisplayValue={suggestedValue}
                // markering af resten af suggestedDisplayValue skal kun ske hvis komponenten har fokus
                preventValueSelection={!focused}
                // updateValueInWillReceiveProps kan bruges til at sætte en ny værdi i feltet. OBS: onInputValueChange kaldes ikke
                // onInputChange giver mulighed for at manipulere værdien når der tastes
                onInputChange={(value, compose) => {
                    log("onInputChange", [value, compose]);
                    return value;
                }}
                // onInputValueChange kaldes når værdien i feltet ændres (bl.. med returværdien af onInputChange når der tastes)
                onInputValueChange={(value, compose) => {
                    log("onInputValueChange", [value, compose]);
                    const suggestion = value === "" ? undefined : suggestions.find(w => w.toLocaleLowerCase().startsWith(value.toLocaleLowerCase()));
                    setSuggestedValue(suggestion);
                    setWrittenValue(value);
                }}

            />
            <p>
                writtenValue: {writtenValue}<br />
                suggestedValue: {suggestedValue}<br />
                displayedValue (opdateres kun når feltet mister fokus): {displayedValue}<br />
            </p>
            <span>Log:</span>
            <div style={{ height: "300px", width: "100%", overflowX: "auto", overflowY: "scroll" }}>
                {logLines.map(l => <div>{l}</div>)}
            </div>>

        </>
    );
}