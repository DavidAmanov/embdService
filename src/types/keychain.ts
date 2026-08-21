export interface KeychainSize {
  label: string;
  widthCm: number;
  heightCm: number;
}

export interface FabricColorOption {
  label: string;
  value: string;
  hex: string;
}

export type BorderStitchType = 'dense' | 'loose' | 'zigzag';

export interface BorderStitchOption {
  label: string;
  value: BorderStitchType;
}

export interface FontOption {
  label: string;
  value: string;
  source: 'google' | 'local';
}
