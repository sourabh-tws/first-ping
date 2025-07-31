declare module 'react-toggle' {
  import * as React from 'react';

  export interface ToggleProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    value?: string;
    id?: string;
    'aria-labelledby'?: string;
    'aria-label'?: string;
    disabled?: boolean;
    hasFocus?: boolean;
    className?: string;
    icons?: boolean | { checked: React.ReactNode; unchecked: React.ReactNode };
  }

  export default class Toggle extends React.Component<ToggleProps> {}
}