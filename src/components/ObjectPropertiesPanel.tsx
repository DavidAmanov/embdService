import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { Button, ColorPicker, Divider, InputNumber, Select, Slider, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FONT_OPTIONS } from '../constants/keychainOptions';

const { Text } = Typography;

interface ObjectPropertiesPanelProps {
  object: fabric.Object | null;
  onChange: () => void;
  onDelete: () => void;
}

function isTextObject(obj: fabric.Object): obj is fabric.Textbox {
  return obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text';
}

const ObjectPropertiesPanel: React.FC<ObjectPropertiesPanelProps> = ({ object, onChange, onDelete }) => {
  const [, forceRerender] = useState(0);

  useEffect(() => {
    forceRerender((n) => n + 1);
  }, [object]);

  if (!object) {
    return (
      <div style={{ padding: 16 }}>
        <Text type="secondary">Выберите объект на холсте, чтобы отредактировать его свойства.</Text>
      </div>
    );
  }

  const refresh = () => {
    object.canvas?.requestRenderAll();
    forceRerender((n) => n + 1);
    onChange();
  };

  const isText = isTextObject(object);
  const isColorable = (object as any).colorable === true || object.type === 'group' || object.type === 'path' || object.type === 'circle' || object.type === 'rect' || object.type === 'polygon' || object.type === 'triangle';

  return (
    <div style={{ padding: 16 }}>
      <Text strong>Свойства объекта</Text>
      <Divider style={{ margin: '12px 0' }} />

      {isText && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text>Шрифт</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={(object as fabric.Textbox).fontFamily || 'Roboto'}
              options={FONT_OPTIONS.map((f) => ({ label: f.label, value: f.value }))}
              onChange={(value) => {
                (object as fabric.Textbox).set('fontFamily', value);
                refresh();
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text>Размер шрифта</Text>
            <Slider
              min={8}
              max={120}
              value={(object as fabric.Textbox).fontSize || 24}
              onChange={(value) => {
                (object as fabric.Textbox).set('fontSize', value);
                refresh();
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text>Цвет текста</Text>
            <div style={{ marginTop: 4 }}>
              <ColorPicker
                value={getTextColor(object as fabric.Textbox)}
                onChange={(color) => {
                  setTextColor(object as fabric.Textbox, color.toHexString());
                  refresh();
                }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Выделите часть текста (двойной клик, затем протяните курсор), чтобы
              покрасить только её. Без выделения меняется цвет всего текста.
            </Text>
          </div>
        </>
      )}

      {!isText && isColorable && (
        <div style={{ marginBottom: 12 }}>
          <Text>Цвет фигуры</Text>
          <div style={{ marginTop: 4 }}>
            <ColorPicker
              value={(getShapeColor(object)) || '#000000'}
              onChange={(color) => {
                setShapeColor(object, color.toHexString());
                refresh();
              }}
            />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <Text>Поворот, °</Text>
        <InputNumber
          style={{ width: '100%', marginTop: 4 }}
          min={-180}
          max={180}
          value={Math.round(object.angle || 0)}
          onChange={(value) => {
            object.set('angle', value ?? 0);
            refresh();
          }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text>Масштаб</Text>
        <Slider
          min={10}
          max={300}
          value={Math.round((object.scaleX || 1) * 100)}
          onChange={(value) => {
            object.set({ scaleX: value / 100, scaleY: value / 100 });
            refresh();
          }}
        />
      </div>

      <Divider style={{ margin: '12px 0' }} />
      <Button danger icon={<DeleteOutlined />} block onClick={onDelete}>
        Удалить объект
      </Button>
    </div>
  );
};

function hasActiveTextSelection(textbox: fabric.Textbox): boolean {
  return (
    textbox.isEditing &&
    typeof textbox.selectionStart === 'number' &&
    typeof textbox.selectionEnd === 'number' &&
    textbox.selectionStart !== textbox.selectionEnd
  );
}

function getTextColor(textbox: fabric.Textbox): string {
  if (hasActiveTextSelection(textbox)) {
    const styles = textbox.getSelectionStyles(textbox.selectionStart, textbox.selectionEnd);
    const fill = styles[0]?.fill as string | undefined;
    if (fill) return fill;
  }
  return (textbox.fill as string) || '#000000';
}

function setTextColor(textbox: fabric.Textbox, color: string) {
  if (hasActiveTextSelection(textbox)) {
    textbox.setSelectionStyles({ fill: color }, textbox.selectionStart, textbox.selectionEnd);
    // Fabric caches the rendered glyphs and doesn't mark the object dirty when
    // per-character styles change, so the new color wouldn't show without this.
    textbox.dirty = true;
  } else {
    textbox.set('fill', color);
  }
}

function getShapeColor(obj: fabric.Object): string | undefined {
  if (obj.type === 'group') {
    const child = (obj as fabric.Group).getObjects()[0];
    return (child?.fill as string) || (child?.stroke as string);
  }
  return (obj.fill as string) || (obj.stroke as string);
}

function setShapeColor(obj: fabric.Object, color: string) {
  if (obj.type === 'group') {
    (obj as fabric.Group).getObjects().forEach((child) => {
      if (child.fill && child.fill !== 'transparent') child.set('fill', color);
      if (child.stroke && child.stroke !== 'transparent') child.set('stroke', color);
    });
    return;
  }
  obj.set('fill', color);
}

export default ObjectPropertiesPanel;
