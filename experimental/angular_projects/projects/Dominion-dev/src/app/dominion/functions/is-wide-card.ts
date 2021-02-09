import { CardType } from '../types/card-type';

export const isWideCard = (cardTypes: CardType[]): boolean =>
       cardTypes.includes('EventCards')
    || cardTypes.includes('LandmarkCards')
    || cardTypes.includes('Boon')
    || cardTypes.includes('Hex')
    || cardTypes.includes('State');
