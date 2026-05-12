import type { Player } from '../types/trip';
import alexPlayerCard from '../../assets/player cards/alex player card.png';
import duckPlayerCard from '../../assets/player cards/duck player card.png';
import mattPlayerCard from '../../assets/player cards/matt player card.png';
import willPlayerCard from '../../assets/player cards/will player card.png';

export const players: Player[] = [
  {
    id: 'matt-colman',
    name: 'Matt Colman',
    caption: 'Patron saint of the group chat and optimistic recovery shots.',
    handicap: 20,
    milkPreference: 'Unpasterised Full Cream',
    imageUrl: mattPlayerCard,
  },
  {
    id: 'alex-scotts',
    name: 'Alex Scotts',
    caption: 'Single-figure menace with a calm walk and a dangerous wedge.',
    handicap: 6,
    milkPreference: 'A2',
    imageUrl: alexPlayerCard,
  },
  {
    id: 'will-turner',
    name: 'Will Turner',
    caption: 'Technician, tactician, and sworn enemy of three-putts.',
    handicap: 14,
    milkPreference: 'Light white',
    imageUrl: willPlayerCard,
  },
  {
    id: 'charlie-turner',
    name: 'Duck Turner',
    caption: 'Low handicap, high standards, soy-powered consistency.',
    handicap: 6,
    milkPreference: 'So good soy milk',
    imageUrl: duckPlayerCard,
  },
];
