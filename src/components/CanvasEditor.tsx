import React, { useEffect, useImperativeHandle, useRef } from 'react';
import * as fabric from 'fabric';
import { BorderStitchType, KeychainSize } from '../types/keychain';
import { PX_PER_CM } from '../constants/keychainOptions';

// Цвет интерфейса выделения объекта (рамка, ручки, линия до ручки поворота).
// Голубой дефолт Fabric сливается со светлыми/голубыми цветами ткани, поэтому
// заменяем его на фиолетовый. Дефолты объявлены на InteractiveFabricObject
// (родитель публичного FabricObject) — конструктор объекта читает их именно
// оттуда, поэтому переопределять нужно там, а не на FabricObject.ownDefaults.
const SELECTION_COLOR = '#7c3aed';
Object.assign(fabric.InteractiveFabricObject.ownDefaults, {
  borderColor: SELECTION_COLOR,
  cornerColor: SELECTION_COLOR,
  cornerStrokeColor: SELECTION_COLOR,
});

// Запас вокруг рабочей области — серая зона, где всегда видны и доступны
// ручки трансформации объекта (поворот рисуется на 40px выше объекта, а
// ручки масштабирования — по углам его повёрнутого bounding box). Размер
// выбран так, чтобы вмещать ручки даже для объекта, растянутого до предела
// MAX_SCALE у самого края рабочей области и повёрнутого на произвольный угол.
const CANVAS_PADDING = 200;

// Верхний предел масштабирования объекта (совпадает с ограничением слайдера
// "Масштаб" в панели свойств) — без него можно растянуть объект мышью через
// угловые ручки настолько, что не хватит никакого разумного запаса CANVAS_PADDING.
const MAX_SCALE = 3;

export interface CanvasEditorHandle {
  addText: () => void;
  addShape: (file: string) => void;
  addImage: (file: string) => void;
  deleteSelected: () => void;
  getActiveObject: () => fabric.Object | null;
  exportPng: () => string;
}

interface CanvasEditorProps {
  size: KeychainSize;
  fabricColor: string;
  borderEnabled: boolean;
  borderType: BorderStitchType;
  onSelectionChange: (obj: fabric.Object | null) => void;
}

const BORDER_STYLE: Record<BorderStitchType, { dash: number[]; width: number }> = {
  dense: { dash: [], width: 6 },
  loose: { dash: [10, 6], width: 4 },
  zigzag: { dash: [4, 4], width: 5 },
};

function drawBorder(
  canvas: fabric.Canvas,
  widthPx: number,
  heightPx: number,
  type: BorderStitchType,
) {
  const existing = canvas.getObjects().find((o) => (o as any).isBorder);
  if (existing) canvas.remove(existing);

  const style = BORDER_STYLE[type];
  const rect = new fabric.Rect({
    left: CANVAS_PADDING,
    top: CANVAS_PADDING,
    originX: 'left',
    originY: 'top',
    width: widthPx,
    height: heightPx,
    fill: 'transparent',
    stroke: '#333333',
    strokeWidth: style.width,
    strokeDashArray: style.dash.length ? style.dash : undefined,
    selectable: false,
    evented: false,
    hoverCursor: 'default',
  });
  (rect as any).isBorder = true;
  canvas.add(rect);
  // Обводка должна быть видна целиком поверх фона ткани (только внутренняя
  // половина strokeWidth перекрывалась бы фоном, если положить её ниже).
  const background = canvas.getObjects().find((o) => (o as any).isBackground);
  if (background) {
    canvas.moveObjectTo(rect, canvas.getObjects().indexOf(background) + 1);
  } else {
    canvas.sendObjectToBack(rect);
  }
}

function drawBackground(canvas: fabric.Canvas, widthPx: number, heightPx: number, color: string) {
  const existing = canvas.getObjects().find((o) => (o as any).isBackground);
  if (existing) canvas.remove(existing);

  const bg = new fabric.Rect({
    left: CANVAS_PADDING,
    top: CANVAS_PADDING,
    originX: 'left',
    originY: 'top',
    width: widthPx,
    height: heightPx,
    fill: color,
    selectable: false,
    evented: false,
    hoverCursor: 'default',
  });
  (bg as any).isBackground = true;
  canvas.add(bg);
  canvas.sendObjectToBack(bg);
}

const CanvasEditor = React.forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  ({ size, fabricColor, borderEnabled, borderType, onSelectionChange }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement | null>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);

    const widthPx = Math.round(size.widthCm * PX_PER_CM);
    const heightPx = Math.round(size.heightCm * PX_PER_CM);

    useEffect(() => {
      if (!canvasElRef.current) return;
      const canvas = new fabric.Canvas(canvasElRef.current, {
        width: widthPx + CANVAS_PADDING * 2,
        height: heightPx + CANVAS_PADDING * 2,
        backgroundColor: '#f0f2f5',
        preserveObjectStacking: true,
        selectionColor: 'rgba(124, 58, 237, 0.3)',
        selectionBorderColor: SELECTION_COLOR,
      });
      fabricRef.current = canvas;

      const handleSelection = () => {
        onSelectionChange(canvas.getActiveObject() ?? null);
      };
      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', () => onSelectionChange(null));

      // Не даём растягивать объект мышью бесконечно — тот же потолок, что и
      // у слайдера "Масштаб" в панели свойств. Без этого лимита никакого
      // разумного CANVAS_PADDING не хватит, чтобы гарантированно вместить
      // ручки трансформации.
      const constrainScale = (obj: fabric.Object) => {
        const scaleX = Math.min(obj.scaleX ?? 1, MAX_SCALE);
        const scaleY = Math.min(obj.scaleY ?? 1, MAX_SCALE);
        if (scaleX !== obj.scaleX || scaleY !== obj.scaleY) {
          obj.set({ scaleX, scaleY });
        }
      };

      // Держим панель свойств в курсе изменений, сделанных прямо на холсте
      // (поворот/масштабирование/перемещение мышью), а не только через панель.
      // Перемещение за пределы рабочей области намеренно не ограничиваем —
      // экспорт (exportPng) всё равно обрезает строго по ней, а серая зона
      // вокруг достаточно большая, чтобы ручки трансформации оставались
      // доступны в любом разумном сценарии.
      const handleObjectTransform = (e: { target?: fabric.Object }) => {
        if (!e.target) return;
        if (e.target === canvas.getActiveObject()) {
          onSelectionChange(e.target);
        }
      };
      const handleObjectScaling = (e: { target?: fabric.Object }) => {
        if (!e.target) return;
        constrainScale(e.target);
        handleObjectTransform(e);
      };
      canvas.on('object:rotating', handleObjectTransform);
      canvas.on('object:scaling', handleObjectScaling);
      canvas.on('object:moving', handleObjectTransform);
      canvas.on('object:modified', handleObjectTransform);

      drawBackground(canvas, widthPx, heightPx, fabricColor);
      if (borderEnabled) drawBorder(canvas, widthPx, heightPx, borderType);

      return () => {
        canvas.dispose();
        fabricRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Resize canvas when keychain size changes
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.setDimensions({
        width: widthPx + CANVAS_PADDING * 2,
        height: heightPx + CANVAS_PADDING * 2,
      });
      drawBackground(canvas, widthPx, heightPx, fabricColor);
      if (borderEnabled) {
        drawBorder(canvas, widthPx, heightPx, borderType);
      } else {
        const existing = canvas.getObjects().find((o) => (o as any).isBorder);
        if (existing) canvas.remove(existing);
      }
      canvas.requestRenderAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [widthPx, heightPx]);

    // Update background color
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      drawBackground(canvas, widthPx, heightPx, fabricColor);
      canvas.requestRenderAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fabricColor]);

    // Update border
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      if (borderEnabled) {
        drawBorder(canvas, widthPx, heightPx, borderType);
      } else {
        const existing = canvas.getObjects().find((o) => (o as any).isBorder);
        if (existing) canvas.remove(existing);
      }
      canvas.requestRenderAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [borderEnabled, borderType]);

    useImperativeHandle(ref, () => ({
      addText: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const text = new fabric.Textbox('Текст', {
          left: CANVAS_PADDING + widthPx / 2,
          top: CANVAS_PADDING + heightPx / 2,
          originX: 'center',
          originY: 'center',
          fontSize: 24,
          fill: '#000000',
          fontFamily: 'Roboto',
          editable: true,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
      },
      addShape: (file: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        fabric.loadSVGFromURL(file).then(({ objects }) => {
          const validObjects = objects.filter((o): o is fabric.Object => o !== null);
          const group = fabric.util.groupSVGElements(validObjects, {}) as fabric.Object;
          group.set({
            left: CANVAS_PADDING + widthPx / 2,
            top: CANVAS_PADDING + heightPx / 2,
            originX: 'center',
            originY: 'center',
          });
          group.scaleToWidth(60);
          canvas.add(group);
          canvas.setActiveObject(group);
          canvas.requestRenderAll();
        });
      },
      addImage: (file: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        fabric.FabricImage.fromURL(file).then((img) => {
          img.set({
            left: CANVAS_PADDING + widthPx / 2,
            top: CANVAS_PADDING + heightPx / 2,
            originX: 'center',
            originY: 'center',
          });
          img.scaleToWidth(80);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
        });
      },
      deleteSelected: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObjects();
        active.forEach((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      },
      getActiveObject: () => fabricRef.current?.getActiveObject() ?? null,
      exportPng: () => {
        const canvas = fabricRef.current;
        if (!canvas) return '';
        return canvas.toDataURL({
          format: 'png',
          multiplier: 4,
          left: CANVAS_PADDING,
          top: CANVAS_PADDING,
          width: widthPx,
          height: heightPx,
        });
      },
    }));

    return (
      <div
        style={{
          display: 'inline-block',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          background: '#fff',
        }}
      >
        <canvas ref={canvasElRef} />
      </div>
    );
  },
);

CanvasEditor.displayName = 'CanvasEditor';

export default CanvasEditor;
