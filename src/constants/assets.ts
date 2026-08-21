export interface ShapeAsset {
  label: string;
  file: string;
  colorable: boolean;
}

// Фигуры лежат в public/shapes как одноцветные SVG — заливку можно менять на канвасе.
export const SHAPE_ASSETS: ShapeAsset[] = [
  { label: 'Круг', file: '/shapes/circle.svg', colorable: true },
  { label: 'Квадрат', file: '/shapes/square.svg', colorable: true },
  { label: 'Треугольник', file: '/shapes/triangle.svg', colorable: true },
  { label: 'Звезда', file: '/shapes/star.svg', colorable: true },
  { label: 'Сердце', file: '/shapes/heart.svg', colorable: true },
  { label: 'Шестиугольник', file: '/shapes/hexagon.svg', colorable: true },
];

export interface ImageAsset {
  label: string;
  file: string;
}

// Готовые PNG без фона добавляются сюда же, в public/images.
export const IMAGE_ASSETS: ImageAsset[] = [];
