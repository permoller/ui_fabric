import { styled, IBasePickerStyleProps, IBasePickerStyles, ITag, ITagPickerProps, ITagItemProps, TagItem, TagItemSuggestion, TagPickerBase, IBasePickerProps, BasePicker } from "office-ui-fabric-react";
import { getStyles } from "office-ui-fabric-react/lib/components/pickers/BasePicker.styles";

export class TagPickerWithResfreshBase extends TagPickerBase {
    public refreshSuggestionsUsingSubclassToAccessProtectedMembers = () => {
        if (!this.state.suggestionsVisible) return;
        const value = this.input.current.value;
        if (value === '' && (this.props.onEmptyResolveSuggestions || this.props.onEmptyInputFocus)) {
            // calls onEmptyResolveSuggestions or onEmptyInputFocus and updates the list of suggestions
            this.onEmptyInputFocus();
        } else {
            // calls onResolveSuggestions and updates the list of suggestions
            this.updateValue(value);
        }
    };

}

export const TagPickerWithRefresh = styled<ITagPickerProps, IBasePickerStyleProps, IBasePickerStyles>(TagPickerWithResfreshBase, getStyles, undefined, {
    scope: 'TagPicker'
});