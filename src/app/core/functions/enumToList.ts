import { ISelect } from '../interfaces/CORE/ISelect';

export function enumToList(enumObj: object): ISelect[] {
  const result: ISelect[] = Object.values(enumObj)
    .filter((value) => isNaN(Number(value)))
    .map((value, index) => {
      return {
        id: index,
        name: value,
      };
    }) as unknown as ISelect[];
  return result;
}
