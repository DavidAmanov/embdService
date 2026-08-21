import { BorderStitchOption, FabricColorOption, FontOption, KeychainSize } from '../types/keychain';

export const KEYCHAIN_SIZES: KeychainSize[] = [
  { label: '12,5 × 3 см', widthCm: 12.5, heightCm: 3 },
  { label: '10 × 3 см', widthCm: 10, heightCm: 3 },
  { label: '8 × 3 см', widthCm: 8, heightCm: 3 },
  { label: '6 × 3 см', widthCm: 6, heightCm: 3 },
  { label: '3 × 3 см', widthCm: 3, heightCm: 3 },
  { label: '5 × 7 см', widthCm: 5, heightCm: 7 },
  { label: '7 × 5 см', widthCm: 7, heightCm: 5 },
  { label: '5 × 5 см', widthCm: 5, heightCm: 5 },
  { label: '7 × 7 см', widthCm: 7, heightCm: 7 },
  { label: '10 × 10 см', widthCm: 10, heightCm: 10 },
  { label: '12 × 4 см', widthCm: 12, heightCm: 4 },
  { label: '12 × 5 см', widthCm: 12, heightCm: 5 },
  { label: '10 × 4 см', widthCm: 10, heightCm: 4 },
  { label: '10 × 5 см', widthCm: 10, heightCm: 5 },
];

export const FABRIC_COLORS: FabricColorOption[] = [
  { label: 'Белый', value: 'white', hex: '#FFFFFF' },
  { label: 'Чёрный', value: 'black', hex: '#1a1a1a' },
  { label: 'Розовый', value: 'pink', hex: '#F5A9C6' },
  { label: 'Тёмно-синий', value: 'navy', hex: '#1B2A4A' },
  { label: 'Серый', value: 'gray', hex: '#9B9B9B' },
  { label: 'Голубой', value: 'lightblue', hex: '#9AD4E8' },
  { label: 'Коричневый', value: 'brown', hex: '#6B4226' },
];

export const BORDER_STITCH_TYPES: BorderStitchOption[] = [
  { label: 'Плотный стежок', value: 'dense' },
  { label: 'Неплотный стежок', value: 'loose' },
  { label: 'Стежок зигзагом', value: 'zigzag' },
];

// Шрифты подключаются либо с Google Fonts (по имени), либо локально из папки /public/fonts.
export const FONT_OPTIONS: FontOption[] = [
  { label: 'Roboto', value: 'Roboto', source: 'google' },
  { label: 'Montserrat', value: 'Montserrat', source: 'google' },
  { label: 'Pacifico', value: 'Pacifico', source: 'google' },
  { label: 'Caveat', value: 'Caveat', source: 'google' },
];

export const PX_PER_CM = 40;
