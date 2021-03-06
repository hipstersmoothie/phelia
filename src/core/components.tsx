import React, { ReactElement } from "react";
import {
  ActionsBlock,
  Button as SlackButton,
  ContextBlock,
  Datepicker,
  DividerBlock,
  ImageBlock as SlackImageBlock,
  ImageElement,
  InputBlock,
  Option as SlackOption,
  PlainTextInput,
  SectionBlock
} from "@slack/web-api";
import { XOR } from "ts-xor";
import {
  InteractionEvent,
  MultiSelectOptionEvent,
  SearchOptionsEvent,
  SelectDateEvent,
  SelectOptionEvent
} from "./interfaces";

interface TextProps {
  children: React.ReactText | React.ReactText[];
  emoji?: boolean;
  type: "plain_text" | "mrkdwn";
  verbatim?: boolean;
}

export const Text = (props: TextProps) => (
  <component
    {...props}
    componentType="text"
    toSlackElement={(props: TextProps) => {
      const instance: any = { type: props.type, text: "" };

      if (props.type === "mrkdwn") {
        instance.verbatim = props.verbatim;
      } else if (props.type === "plain_text") {
        instance.emoji = props.emoji;
      }

      return instance;
    }}
  />
);

Text.defaultProps = {
  type: "plain_text"
};

interface ButtonBase {
  children: string;
  confirm?: ReactElement;
  emoji?: boolean;
  style?: undefined | "danger" | "primary";
  url?: string;
}

interface ButtonWithOnClick extends ButtonBase {
  onClick: (event: InteractionEvent) => void | Promise<void>;
  action: string;
  children: string;
}

type ButtonProps = XOR<ButtonWithOnClick, ButtonBase>;

export const Button = (props: ButtonProps) => (
  <component
    {...props}
    componentType={"button"}
    toSlackElement={(props, reconcile, promises): SlackButton => {
      const instance: SlackButton = {
        type: "button",
        action_id: props.action,
        style: props.style,
        url: props.url,
        text: { type: "plain_text", text: "", emoji: props.emoji }
      };

      const [confirm, confirmPromises] = reconcile(props.confirm);

      instance.confirm = confirm;
      promises.push(...confirmPromises);

      return instance;
    }}
  />
);

type SectionProps =
  | {
      accessory?: ReactElement;
      text: ReactElement | string;
    }
  | {
      accessory?: ReactElement;
      children: ReactElement | ReactElement[];
    };

export const Section = (props: SectionProps) => (
  <component
    {...props}
    componentType="section"
    toSlackElement={(props, reconcile, promises): SectionBlock => {
      const instance: SectionBlock = {
        type: "section"
      };
      const [accessory, accessoryPromises] = reconcile(props.accessory);
      const [text, textPromises] = reconcile(props.text);

      instance.text = text;
      instance.accessory = accessory;

      if (instance.text && text.type === "text") {
        instance.text.type = "plain_text";
      }

      promises.push(...accessoryPromises, ...textPromises);

      return instance;
    }}
  />
);

interface ActionsProps {
  children: ReactElement | ReactElement[];
}

export const Actions = (props: ActionsProps) => (
  <component
    {...props}
    componentType="actions"
    toSlackElement={(): ActionsBlock => ({
      type: "actions",
      elements: []
    })}
  />
);

interface ImageProps {
  imageUrl: string;
  alt: string;
}

export const Image = (props: ImageProps) => (
  <component
    {...props}
    componentType="image"
    toSlackElement={(props): ImageElement => ({
      type: "image",
      image_url: props.imageUrl,
      alt_text: props.alt
    })}
  />
);

interface ImageBlockProps {
  imageUrl: string;
  alt: string;
  emoji?: boolean;
  title?: string;
}

export const ImageBlock = (props: ImageBlockProps) => (
  <component
    {...props}
    componentType="image-block"
    toSlackElement={(props): SlackImageBlock => {
      const instance: any = {
        type: "image",
        image_url: props.imageUrl,
        alt_text: props.alt
      };

      if (props.title) {
        instance.title = {
          type: "plain_text",
          text: props.title,
          emoji: props.emoji
        };
      }

      return instance;
    }}
  />
);

export const Divider = () => (
  <component
    componentType="divider"
    toSlackElement={(): DividerBlock => ({ type: "divider" })}
  />
);

interface ContextProps {
  children: ReactElement | ReactElement[];
}

export const Context = (props: ContextProps) => (
  <component
    {...props}
    componentType="context"
    toSlackElement={(): ContextBlock => ({ type: "context", elements: [] })}
  />
);

interface ConfirmProps {
  children: ReactElement | string;
  confirm: ReactElement | string;
  deny: ReactElement | string;
  style?: "danger" | "primary";
  title: ReactElement | string;
}

export const Confirm = (props: ConfirmProps) => (
  <component
    {...props}
    componentType="confirm"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        // using a function so the appendInitialChild can determine the type of the component
        // whereas slack forbids a confirm object to have a 'type' property
        isConfirm: () => true,

        style: props.style
      };

      const [title, titlePromises] = reconcile(props.title);
      const [confirm, confirmPromises] = reconcile(props.confirm);
      const [deny, denyPromises] = reconcile(props.deny);

      instance.title = title;
      instance.confirm = confirm;
      instance.deny = deny;

      instance.title.type = "plain_text";
      instance.confirm.type = "plain_text";
      instance.deny.type = "plain_text";

      promises.push(...titlePromises, ...confirmPromises, ...denyPromises);

      return instance;
    }}
  />
);

interface OptionProps {
  children: ReactElement | string;
  value: string;
  description?: ReactElement | string;
  url?: string;
  selected?: boolean;
}

export const Option = (props: OptionProps) => (
  <component
    {...props}
    componentType="option"
    toSlackElement={(props, reconcile, promises): Promise<SlackOption> => {
      const instance: any = {
        isSelected: () => props.selected,
        isOption: () => true,
        value: props.value,
        url: props.url
      };

      const [description, descriptionPromises] = reconcile(props.description);

      instance.description = description;

      if (instance.description) {
        instance.description.type = "plain_text";
      }

      promises.push(...descriptionPromises);

      return instance;
    }}
  />
);

interface DatePickerProps {
  action: string;
  confirm?: ReactElement;
  initialDate?: string;
  onSelect?: (event: SelectDateEvent) => void | Promise<void>;
  placeholder?: ReactElement | string;
}

export const DatePicker = (props: DatePickerProps) => (
  <component
    {...props}
    componentType="confirm"
    toSlackElement={(props, reconcile, promises): Datepicker => {
      const instance: Datepicker = {
        type: "datepicker",
        initial_date: props.initialDate,
        action_id: props.action
      };

      const [placeholder, placeholderPromises] = reconcile(props.placeholder);
      const [confirm, confirmPromises] = reconcile(props.confirm);

      instance.placeholder = placeholder;
      instance.confirm = confirm;

      if (instance.placeholder) {
        instance.placeholder.type = "plain_text";
      }

      promises.push(...placeholderPromises, ...confirmPromises);

      return instance;
    }}
  />
);

interface MessageProps {
  children: ReactElement | ReactElement[];
  text?: string;
}

export const Message = (props: MessageProps) => (
  <component
    {...props}
    componentType="message"
    toSlackElement={({ text }) => ({ blocks: [], text })}
  />
);

interface ModalProps {
  children: ReactElement | ReactElement[];
  title: ReactElement | string;
  submit?: ReactElement | string;
  close?: ReactElement | string;
}

export const Modal = (props: ModalProps) => (
  <component
    {...props}
    componentType="modal"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        type: "modal",
        blocks: []
      };

      const [title, titlePromises] = reconcile(props.title);
      const [submit, submitPromises] = reconcile(props.submit);
      const [close, closePromises] = reconcile(props.close);

      instance.title = title;
      instance.submit = submit;
      instance.close = close;

      if (instance.title) {
        instance.title.type = "plain_text";
      }

      if (instance.submit) {
        instance.submit.type = "plain_text";
      }

      if (instance.close) {
        instance.close.type = "plain_text";
      }

      promises.push(...titlePromises, ...submitPromises, ...closePromises);

      return instance;
    }}
  />
);

interface InputProps {
  label: string | ReactElement;
  children: ReactElement;
  hint?: string | ReactElement;
  optional?: boolean;
}
export const Input = (props: InputProps) => (
  <component
    {...props}
    componentType="input"
    toSlackElement={(props, reconcile, promises): InputBlock => {
      const instance: any = {
        type: "input",
        optional: props.optional
      };

      const [hint, hintPromises] = reconcile(props.hint);
      const [label, labelPromises] = reconcile(props.label);

      instance.hint = hint;
      instance.label = label;

      if (instance.label) {
        instance.label.type = "plain_text";
      }

      if (instance.hint) {
        instance.hint.type = "plain_text";
      }

      promises.push(...hintPromises, ...labelPromises);

      return instance;
    }}
  />
);

interface TextFieldProps {
  action: string;
  initialValue?: string;
  maxLength?: number;
  minLength?: number;
  multiline?: boolean;
  placeholder?: ReactElement | string;
}
export const TextField = (props: TextFieldProps) => (
  <component
    {...props}
    componentType="text-field"
    toSlackElement={(props, reconcile, promises): PlainTextInput => {
      const instance: PlainTextInput = {
        type: "plain_text_input",
        initial_value: props.initialValue,
        action_id: props.action,
        max_length: props.maxLength,
        min_length: props.minLength,
        multiline: props.multiline
      };

      const [placeholder, placeholderPromises] = reconcile(props.placeholder);

      instance.placeholder = placeholder;

      if (instance.placeholder) {
        instance.placeholder.type = "plain_text";
      }

      promises.push(...placeholderPromises);

      return instance;
    }}
  />
);

interface CheckboxesProps {
  action: string;
  children: ReactElement | ReactElement[];
  confirm?: ReactElement;
  onSelect?: (event: MultiSelectOptionEvent) => void | Promise<void>;
}

export const Checkboxes = (props: CheckboxesProps) => (
  <component
    {...props}
    componentType="checkboxes"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        type: "checkboxes",
        action_id: props.action,
        options: []
      };

      const [{ fields: options }, optionPromises] = reconcile(
        React.createElement(Section, { children: props.children })
      );
      const [confirm, confirmPromises] = reconcile(props.confirm);

      if (Array.isArray(options)) {
        const selectedOptions = options
          .filter(option => option.isSelected())
          .map(option => ({ ...option, url: undefined }));

        instance.initial_options = selectedOptions.length
          ? selectedOptions
          : undefined;
      }

      instance.confirm = confirm;

      promises.push(...optionPromises, ...confirmPromises);

      return instance;
    }}
  />
);

interface OverflowMenuProps {
  action: string;
  children: ReactElement | ReactElement[];
  confirm?: ReactElement;
  onSelect?: (event: SelectOptionEvent) => void | Promise<void>;
}

export const OverflowMenu = (props: OverflowMenuProps) => (
  <component
    {...props}
    componentType="overflow"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        type: "overflow",
        action_id: props.action,
        options: []
      };

      const [confirm, confirmPromises] = reconcile(props.confirm);

      instance.confirm = confirm;

      promises.push(...confirmPromises);

      return instance;
    }}
  />
);

interface RadioButtonsProps {
  action: string;
  children: ReactElement | ReactElement[];
  confirm?: ReactElement;
  onSelect?: (event: SelectOptionEvent) => void | Promise<void>;
}

export const RadioButtons = (props: RadioButtonsProps) => (
  <component
    {...props}
    componentType="radio-buttons"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        type: "radio_buttons",
        action_id: props.action,
        options: []
      };

      const [{ fields: options }, optionPromises] = reconcile(
        React.createElement(Section, { children: props.children })
      );
      const [confirm, confirmPromises] = reconcile(props.confirm);

      if (Array.isArray(options)) {
        const selectedOption = options
          .map(option => ({
            ...option,
            url: undefined
          }))
          .find(option => option.isSelected());

        instance.initial_option = selectedOption;
      }

      instance.confirm = confirm;

      promises.push(...optionPromises, ...confirmPromises);
      return instance;
    }}
  />
);

interface OptionGroupProps {
  label: ReactElement | string;
  children: ReactElement | ReactElement[];
}

export const OptionGroup = (props: OptionGroupProps) => (
  <component
    {...props}
    componentType="option-group"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        isOptionGroup: () => true,
        options: []
      };

      const [label, labelPromises] = reconcile(props.label);

      instance.label = label;

      if (instance.label) {
        instance.label.type = "plain_text";
      }

      promises.push(...labelPromises);

      return instance;
    }}
  />
);

interface SelectMenuBase {
  action: string;
  placeholder: ReactElement | string;
  confirm?: ReactElement;
  onSelect?: (event: SelectOptionEvent) => void | Promise<void>;
}

interface StaticSelectMenu extends SelectMenuBase {
  type: "static";
  children: ReactElement | ReactElement[];
}

interface UserSelectMenu extends SelectMenuBase {
  type: "users";
  initialUser?: string;
}

interface ChannelSelectMenu extends SelectMenuBase {
  type: "channels";
  initialChannel?: string;
}

export type SearchOptions = (
  event: SearchOptionsEvent
) => ReactElement[] | Promise<ReactElement[]>;

interface ExternalSelectMenu extends SelectMenuBase {
  type: "external";
  initialOption?: ReactElement;
  onSearchOptions: SearchOptions;
  minQueryLength?: number;
}

interface ConversationSelectMenu extends SelectMenuBase {
  type: "conversations";
  initialConversation?: string;
  filter?: {
    include?: ("im" | "mpim" | "private" | "public")[];
    excludeExternalSharedChannels?: boolean;
    excludeBotUsers?: boolean;
  };
}

type SelectMenuProps =
  | ChannelSelectMenu
  | ConversationSelectMenu
  | ExternalSelectMenu
  | StaticSelectMenu
  | UserSelectMenu;

export const SelectMenu = (props: SelectMenuProps) => (
  <component
    {...props}
    componentType="select-menu"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        type: props.type + "_select",
        action_id: props.action,
        onSearchOptions: props.onSearchOptions
      };

      const [confirm, confirmPromises] = reconcile(props.confirm);
      const [placeholder, placeholderPromises] = reconcile(props.placeholder);
      const [{ fields: optionsOrGroups }, optionPromises] = reconcile(
        React.createElement(Section, { children: props.children })
      );
      const [initialOption, initialOptionPromises] = reconcile(
        props.initialOption
      );

      if (
        props.type === "static" &&
        Array.isArray(optionsOrGroups) &&
        optionsOrGroups.length
      ) {
        const isGroup = Boolean(optionsOrGroups[0].isOptionGroup);
        let options = optionsOrGroups;

        if (isGroup) {
          options = optionsOrGroups.reduce((options, group) => {
            options.push(...group.options);
            return options;
          }, []);
        }

        const selectedOption = options
          .map(option => ({
            ...option,
            url: undefined
          }))
          .find(option => option.isSelected());

        instance.initial_option = selectedOption;
      }

      if (props.type === "external") {
        if (initialOption) {
          instance.initial_option = { ...initialOption, url: undefined };
        }

        instance.min_query_length = props.minQueryLength;
      }

      if (props.type === "users") {
        instance.initial_user = props.initialUser;
      }

      if (props.type === "channels") {
        instance.initial_channel = props.initialChannel;
      }

      if (props.type === "conversations") {
        instance.initial_conversation = props.initialConversation;

        if (props.filter) {
          instance.filter = {};
          instance.filter.include = props.filter.include;
          instance.filter.exclude_external_shared_channels =
            props.filter.excludeExternalSharedChannels;
          instance.filter.exclude_bot_users = props.filter.excludeBotUsers;
        }
      }

      instance.confirm = confirm;
      instance.placeholder = placeholder;

      if (instance.placeholder) {
        instance.placeholder.type = "plain_text";
      }

      promises.push(
        ...confirmPromises,
        ...placeholderPromises,
        ...optionPromises,
        ...initialOptionPromises
      );

      return instance;
    }}
  />
);

SelectMenu.defaultProps = {
  type: "static"
} as SelectMenuProps;

interface MultiSelectMenuBase {
  action: string;
  placeholder: ReactElement | string;
  confirm?: ReactElement;
  onSelect?: (event: MultiSelectOptionEvent) => void | Promise<void>;
  maxSelectedItems?: number;
}

interface MultiStaticSelectMenu extends MultiSelectMenuBase {
  type: "static";
  children: ReactElement | ReactElement[];
}

interface MultiUserSelectMenu extends MultiSelectMenuBase {
  type: "users";
  initialUsers?: string[];
}

interface MultiChannelSelectMenu extends MultiSelectMenuBase {
  type: "channels";
  initialChannels?: string[];
}

interface MultiExternalSelectMenu extends MultiSelectMenuBase {
  type: "external";
  initialOptions?: ReactElement[];
  onSearchOptions: SearchOptions;
  minQueryLength?: number;
}

interface MultiConversationSelectMenu extends MultiSelectMenuBase {
  type: "conversations";
  initialConversations?: string[];
  filter?: {
    include?: ("im" | "mpim" | "private" | "public")[];
    excludeExternalSharedChannels?: boolean;
    excludeBotUsers?: boolean;
  };
}

type MultiSelectMenuProps =
  | MultiChannelSelectMenu
  | MultiConversationSelectMenu
  | MultiExternalSelectMenu
  | MultiStaticSelectMenu
  | MultiUserSelectMenu;

export const MultiSelectMenu = (props: MultiSelectMenuProps) => (
  <component
    {...props}
    componentType="multi-select-menu"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        type: "multi_" + props.type + "_select",
        action_id: props.action,
        max_selected_items: props.maxSelectedItems,
        onSearchOptions: props.onSearchOptions
      };

      const [confirm, confirmPromises] = reconcile(props.confirm);
      const [placeholder, placeholderPromises] = reconcile(props.placeholder);
      const [{ fields: optionsOrGroups }, optionPromises] = reconcile(
        React.createElement(Section, { children: props.children })
      );
      const [{ fields: initialOptions }, initialOptionsPromises] = reconcile(
        React.createElement(Section, { children: props.children })
      );

      if (
        props.type === "static" &&
        Array.isArray(optionsOrGroups) &&
        optionsOrGroups.length
      ) {
        const isGroup = Boolean(optionsOrGroups[0].isOptionGroup);
        let options = optionsOrGroups;

        if (isGroup) {
          options = optionsOrGroups.reduce((options, group) => {
            options.push(...group.options);
            return options;
          }, []);
        }

        const selectedOptions = options
          .map(option => ({
            ...option,
            url: undefined
          }))
          .filter(option => option.isSelected());

        instance.initial_options = selectedOptions;
      }

      if (props.type === "external") {
        instance.initial_options = initialOptions;
        instance.min_query_length = props.minQueryLength;
      }

      if (props.type === "users") {
        instance.initial_users = props.initialUsers;
      }

      if (props.type === "channels") {
        instance.initial_channels = props.initialChannels;
      }

      if (props.type === "conversations") {
        instance.initial_conversations = props.initialConversations;

        if (props.filter) {
          instance.filter = {};
          instance.filter.include = props.filter.include;
          instance.filter.exclude_external_shared_channels =
            props.filter.excludeExternalSharedChannels;
          instance.filter.exclude_bot_users = props.filter.excludeBotUsers;
        }
      }

      instance.confirm = confirm;
      instance.placeholder = placeholder;

      if (instance.placeholder) {
        instance.placeholder.type = "plain_text";
      }

      promises.push(
        ...confirmPromises,
        ...placeholderPromises,
        ...optionPromises,
        ...initialOptionsPromises
      );

      return instance;
    }}
  />
);

MultiSelectMenu.defaultProps = {
  type: "static"
} as MultiSelectMenuProps;

interface HomeProps {
  children: ReactElement | ReactElement[];
  title?: ReactElement | string;
}

export const Home = (props: HomeProps) => (
  <component
    {...props}
    componentType="home"
    toSlackElement={(props, reconcile, promises) => {
      const instance: any = {
        type: "home",
        blocks: []
      };

      const [title, titlePromises] = reconcile(props.title);

      instance.title = title;

      if (instance.title) {
        instance.title.type = "plain_text";
      }

      promises.push(...titlePromises);

      return instance;
    }}
  />
);
