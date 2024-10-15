import { Autocomplete, TextField } from '@mui/material';
import { WithBindingProps } from '../../types/binding-control-props';

type BindingControlsProps = {
  binding: string;
  index: number;
  placeholder: string;
  label: string;
  changeBinding: (index: number, value: string) => void;
};

export function BindingControls({
  binding,
  index,
  bindings,
  bindingsLabel,
  placeholder,
  label,
  changeBinding,
}: WithBindingProps<BindingControlsProps>): JSX.Element {
  return bindings ? (
    <Autocomplete
      value={binding}
      onChange={(_, value) => {
        if (value !== null) {
          changeBinding(index, value);
        }
      }}
      options={bindings}
      sx={{ width: '100%' }}
      renderInput={(params) => <TextField {...params} label={bindingsLabel} />}
    />
  ) : (
    <TextField
      label={label}
      variant='outlined'
      value={binding}
      fullWidth
      onChange={(e) => {
        changeBinding(index, e.target.value);
      }}
      placeholder={placeholder}
    />
  );
}
