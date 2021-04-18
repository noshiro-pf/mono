import { Card, CardsWithDisplayValue } from './card-type';

export type Player6Cards = readonly [Card, Card, Card, Card, Card, Card];

export type Player6CardsWithDisplayValue = readonly [
  CardsWithDisplayValue,
  CardsWithDisplayValue,
  CardsWithDisplayValue,
  CardsWithDisplayValue,
  CardsWithDisplayValue,
  CardsWithDisplayValue
];
