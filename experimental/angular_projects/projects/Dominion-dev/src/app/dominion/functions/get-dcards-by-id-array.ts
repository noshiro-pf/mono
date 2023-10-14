import { DCard } from '../online-game/types/dcard';

export const getDCardsByIdArray = (
  idArray: number[] | void,
  dcards: DCard[],
): DCard[] => {
  // cardIdArrayの順番で取得
  if (!idArray) return dcards;
  return idArray
    .map((id) => dcards.find((c) => c.id === id))
    .filter((e) => e !== undefined) as DCard[];
};
