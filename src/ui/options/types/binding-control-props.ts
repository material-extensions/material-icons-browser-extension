/**
 * If binding values are provided, the component will render a dropdown for selecting the binding values.
 * Therefor, the `bindings` and `bindingsLabel` props are required.
 */
export type WithBindingProps<T> = T &
  (
    | { bindings: string[] | undefined; bindingsLabel: string | undefined }
    | { bindings?: undefined; bindingsLabel?: undefined }
  );
