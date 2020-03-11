import React from "react";
import { timeoutAsync, getRandomStrings } from "../utils";
import { TagPickerBase, BasePicker, IBasePickerProps, TagPicker } from "office-ui-fabric-react";
import { TagPickerWithRefresh, TagPickerWithResfreshBase } from "./TagPickerWithRefresh";

export const TagPickerWithRefreshDemo = () => {

    const pickerRef = React.useRef<TagPickerBase>(null);

    const getRandomSuggestionsAsync = async () => {
        console.log("fetching suggestions");
        await timeoutAsync(2000);
        console.log("suggestions fetched");
        setTimeout(() => {
            console.log("refresh suggestions");
            refreshSuggestions1(pickerRef.current)
        }, 3000);
        return getRandomStrings().map(s => ({ key: s, name: s }));
    }
    const refreshSuggestions1 = <T, P extends IBasePickerProps<T>>(picker: BasePicker<T, P>) => {
        // to be able to access protected members without Typescript errors we cast to any
        const p = picker as any;
        if (!picker.state.suggestionsVisible) return;
        const value = p.input.current.value;
        if (value === '' && (picker.props.onEmptyResolveSuggestions || picker.props.onEmptyInputFocus)) {
            // calls onEmptyResolveSuggestions or onEmptyInputFocus and updates the list of suggestions
            p.onEmptyInputFocus();
        } else {
            // calls onResolveSuggestions and updates the list of suggestions
            p.updateValue(value);
        }
    }

    const picker2Ref = React.useRef<TagPickerWithResfreshBase>(null);
    const getRandomSuggestions2Async = async () => {
        console.log("fetching suggestions 2");
        await timeoutAsync(2000);
        console.log("suggestions fetched 2");
        setTimeout(() => {
            console.log("refresh suggestions 2");
            picker2Ref.current.refreshSuggestions();
        }, 3000);
        return getRandomStrings().map(s => ({ key: s, name: s }));
    }

    const picker3Ref = React.useRef<TagPickerBase>(null);
    const getRandomSuggestions3Async = async () => {
        console.log("fetching suggestions 3");
        await timeoutAsync(2000);
        console.log("suggestions fetched 3");
        setTimeout(() => {
            console.log("refresh suggestions 3");
            refreshSuggestions3.bind(picker3Ref.current)();
        }, 3000);
        return getRandomStrings().map(s => ({ key: s, name: s }));
    }
    function refreshSuggestions3(this: TagPickerBase) {
        if (!this.state.suggestionsVisible) return;
        const value = this.input.current.value;
        if (value === '' && (this.props.onEmptyResolveSuggestions || this.props.onEmptyInputFocus)) {
            // calls onEmptyResolveSuggestions or onEmptyInputFocus and updates the list of suggestions
            this.onEmptyInputFocus();
        } else {
            // calls onResolveSuggestions and updates the list of suggestions
            this.updateValue(value);
        }
    }

    return (
        <>
            <h1>Demo af TagPicker som kan opdatere listen af valgmuligheder</h1>
            <p>
                Der genereres tilfældige valgmuligheder hver gang listen af valgmuligheder vises.
                Hentning af valgmuligheder tager et sekund. I dette sekund vises en spinner.
                Efter valgmulighederne er hentet vises de i tre sekunder hvorefter TagPicker komponenten bliver bedt om at genindlæse listen af vaægmuligheder.
            </p>
            <p>Dette er en TagPicker hvor vi laver et cast til any for at tilgå protected felter for at tvinge en genindlæsning af valgmulighederne.</p>
            <TagPicker
                componentRef={pickerRef}
                onEmptyResolveSuggestions={getRandomSuggestionsAsync}
                onResolveSuggestions={getRandomSuggestionsAsync} />
            <p>Dette er en custom TagPicker som arver fra den normale TagPicker for at kunne tilgå de protectede felter. Men den er nødt til at importere noget diekte fra en fil langt inde i maven på office-ui-fabric-react for at undgå at skulle style komponenten manuelt.</p>
            <TagPickerWithRefresh
                componentRef={picker2Ref}
                onEmptyResolveSuggestions={getRandomSuggestions2Async}
                onResolveSuggestions={getRandomSuggestions2Async} />

            <p>Dette er en TagPicker hvor vi laver custom bind af en funktions this-parameter for at tilgå de protectede felter.</p>
            <TagPicker
                componentRef={picker3Ref}
                onEmptyResolveSuggestions={getRandomSuggestions3Async}
                onResolveSuggestions={getRandomSuggestions3Async} />
        </>
    );
}