/**
 * A helper function to check if an object has a key value, without including prooerties from the prototype chain.
 */
export function objectHas(obj: object, key: string) {
  return obj.hasOwnProperty(key);
}
