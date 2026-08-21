import React from 'react';
import { Button, Divider, Radio, Select, Switch, Typography } from 'antd';
import { EditOutlined, PictureOutlined } from '@ant-design/icons';
import { KEYCHAIN_SIZES, FABRIC_COLORS, BORDER_STITCH_TYPES } from '../constants/keychainOptions';
import { SHAPE_ASSETS } from '../constants/assets';
import { BorderStitchType, KeychainSize } from '../types/keychain';

const { Text } = Typography;

interface DesignControlsProps {
  size: KeychainSize;
  onSizeChange: (size: KeychainSize) => void;
  fabricColorHex: string;
  onFabricColorChange: (hex: string) => void;
  borderEnabled: boolean;
  onBorderEnabledChange: (enabled: boolean) => void;
  borderType: BorderStitchType;
  onBorderTypeChange: (type: BorderStitchType) => void;
  onAddText: () => void;
  onAddShape: (file: string) => void;
}

const DesignControls: React.FC<DesignControlsProps> = ({
  size,
  onSizeChange,
  fabricColorHex,
  onFabricColorChange,
  borderEnabled,
  onBorderEnabledChange,
  borderType,
  onBorderTypeChange,
  onAddText,
  onAddShape,
}) => {
  return (
    <div style={{ padding: 16 }}>
      <Text strong>1. Размер брелка</Text>
      <Select
        style={{ width: '100%', marginTop: 8 }}
        value={size.label}
        options={KEYCHAIN_SIZES.map((s) => ({ label: s.label, value: s.label }))}
        onChange={(label) => {
          const found = KEYCHAIN_SIZES.find((s) => s.label === label);
          if (found) onSizeChange(found);
        }}
      />

      <Divider style={{ margin: '16px 0' }} />

      <Text strong>2. Цвет ткани</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {FABRIC_COLORS.map((c) => (
          <div
            key={c.value}
            title={c.label}
            onClick={() => onFabricColorChange(c.hex)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: c.hex,
              border: fabricColorHex === c.hex ? '3px solid #1677ff' : '1px solid #d9d9d9',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <Text strong>3. Окантовка</Text>
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <Switch checked={borderEnabled} onChange={onBorderEnabledChange} /> <Text style={{ marginLeft: 8 }}>Есть окантовка</Text>
      </div>
      {borderEnabled && (
        <Radio.Group
          value={borderType}
          onChange={(e) => onBorderTypeChange(e.target.value)}
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {BORDER_STITCH_TYPES.map((b) => (
            <Radio key={b.value} value={b.value}>
              {b.label}
            </Radio>
          ))}
        </Radio.Group>
      )}

      <Divider style={{ margin: '16px 0' }} />

      <Text strong>4. Текст</Text>
      <Button icon={<EditOutlined />} block style={{ marginTop: 8 }} onClick={onAddText}>
        Добавить текст
      </Button>

      <Divider style={{ margin: '16px 0' }} />

      <Text strong>5. Картинки и фигуры</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {SHAPE_ASSETS.map((shape) => (
          <Button
            key={shape.file}
            style={{ width: 60, height: 60, padding: 4 }}
            onClick={() => onAddShape(shape.file)}
            title={shape.label}
          >
            <img src={shape.file} alt={shape.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Button>
        ))}
        {SHAPE_ASSETS.length === 0 && (
          <Text type="secondary">
            <PictureOutlined /> Фигуры не найдены
          </Text>
        )}
      </div>
    </div>
  );
};

export default DesignControls;
