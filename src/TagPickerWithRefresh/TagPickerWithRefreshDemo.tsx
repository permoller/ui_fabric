import React from "react";
import { timeoutAsync, getRandomStrings } from "../utils";
import { TagPickerBase, BasePicker, IBasePickerProps, TagPicker } from "office-ui-fabric-react";
import { TagPickerWithRefresh, TagPickerWithResfreshBase } from "./TagPickerWithRefresh";

export const TagPickerWithRefreshDemo = () => {


    const picker1Ref = React.useRef<TagPickerBase>(null);
    const picker2Ref = React.useRef<TagPickerWithResfreshBase>(null);
    const picker3Ref = React.useRef<TagPickerBase>(null);

    const refreshSuggestionsUsingCastToAnyToAccessProtectedMembers = <T, P extends IBasePickerProps<T>>(picker: BasePicker<T, P>) => {
        // to be able to access protected members without Typescript errors we cast to any
        // this metod can be used with all components that inherit from BasePicker
        // Note that we loose typesafty when casting to any
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
    const refreshSuggestionsUsingBindingToThisToAccessProtectedMembers = (picker: TagPickerBase) => {
        // this method does not work with the generic PickerBase
        const refreshSuggestions = function (this: TagPickerBase) {
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
        refreshSuggestions.bind(picker)();
    }


    const getRandomSuggestionsAsync = async () => {
        console.log("fetching suggestions");
        await timeoutAsync(2000);
        return getRandomStrings().map(s => ({ key: s, name: s }));
    }

    setInterval(() => {
        refreshSuggestionsUsingCastToAnyToAccessProtectedMembers(picker1Ref.current);
        picker2Ref.current.refreshSuggestionsUsingSubclassToAccessProtectedMembers();
        refreshSuggestionsUsingBindingToThisToAccessProtectedMembers(picker3Ref.current);
    }, 5000);

    return (
        <>
            <h1>Demo af TagPicker som kan opdatere listen af valgmuligheder</h1>
            <p>
                Der genereres tilfældige valgmuligheder hver gang listen af valgmuligheder vises.
                Hentning af valgmuligheder tager et sekund. I dette sekund vises en spinner.
                Der logges en besked til konsollen hver gang valgmulighederne hentes.
                Hvert 5. sekund vil TagPicker komponenterne bliver bedt om at genindlæse listen af valgmuligheder.
            </p>
            <p>
                Måden de forskellige komponenter tvinges til at genindlæse valgmulighederne er den samme. Det sker ved at tilgå nogle protectede properties på PickerBase.
                Her er nogle forskellige måder at tilgå de protectede felter.
            </p>
            <p>Dette er en TagPicker hvor vi laver et cast til any for at tilgå protected felter.</p>
            <TagPicker
                componentRef={picker1Ref}
                onEmptyResolveSuggestions={getRandomSuggestionsAsync}
                onResolveSuggestions={getRandomSuggestionsAsync} />
            <p>Dette er en custom TagPicker som arver fra den normale TagPicker for at kunne tilgå de protectede felter. Men den er nødt til at importere noget diekte fra en fil langt inde i maven på office-ui-fabric-react for at undgå at skulle style komponenten manuelt.</p>
            <TagPickerWithRefresh
                componentRef={picker2Ref}
                onEmptyResolveSuggestions={getRandomSuggestionsAsync}
                onResolveSuggestions={getRandomSuggestionsAsync} />

            <p>Dette er en TagPicker hvor vi laver custom bind af en funktions this-parameter for at tilgå de protectede felter.</p>
            <TagPicker
                componentRef={picker3Ref}
                onEmptyResolveSuggestions={getRandomSuggestionsAsync}
                onResolveSuggestions={getRandomSuggestionsAsync} />
        </>
    );
}