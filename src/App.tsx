import React, { useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Layout, Typography, Button, ConfigProvider } from 'antd';
import { SendOutlined, DeleteOutlined } from '@ant-design/icons';
import ruRU from 'antd/locale/ru_RU';
import CanvasEditor, { CanvasEditorHandle } from './components/CanvasEditor';
import DesignControls from './components/DesignControls';
import ObjectPropertiesPanel from './components/ObjectPropertiesPanel';
import OrderModal from './components/OrderModal';
import { KEYCHAIN_SIZES, FABRIC_COLORS } from './constants/keychainOptions';
import { BorderStitchType, KeychainSize } from './types/keychain';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const [size, setSize] = useState<KeychainSize>(KEYCHAIN_SIZES[0]);
  const [fabricColorHex, setFabricColorHex] = useState<string>(FABRIC_COLORS[0].hex);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderType, setBorderType] = useState<BorderStitchType>('dense');
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [, forcePropsRerender] = useState(0);

  const editorRef = useRef<CanvasEditorHandle>(null);

  const handleDelete = () => {
    editorRef.current?.deleteSelected();
    setActiveObject(null);
  };

  const handleOrder = () => {
    const dataUrl = editorRef.current?.exportPng() ?? null;
    setPreviewUrl(dataUrl);
    setOrderModalOpen(true);
  };

  return (
    <ConfigProvider locale={ruRU} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Конструктор дизайна ремувки
          </Title>
          <Button type="primary" icon={<SendOutlined />} onClick={handleOrder}>
            Заказать
          </Button>
        </Header>
        <Layout>
          <Sider width={320} theme="light" style={{ overflowY: 'auto' }}>
            <DesignControls
              size={size}
              onSizeChange={setSize}
              fabricColorHex={fabricColorHex}
              onFabricColorChange={setFabricColorHex}
              borderEnabled={borderEnabled}
              onBorderEnabledChange={setBorderEnabled}
              borderType={borderType}
              onBorderTypeChange={setBorderType}
              onAddText={() => editorRef.current?.addText()}
              onAddShape={(file) => editorRef.current?.addShape(file)}
            />
          </Sider>
          <Content
            style={{
              padding: 24,
              background: '#f0f2f5',
              overflow: 'auto',
            }}
          >
            <div style={{ width: 'fit-content', margin: '0 auto' }}>
              <CanvasEditor
                ref={editorRef}
                size={size}
                fabricColor={fabricColorHex}
                borderEnabled={borderEnabled}
                borderType={borderType}
                onSelectionChange={(obj) => {
                  setActiveObject(obj);
                  forcePropsRerender((n) => n + 1);
                }}
              />
              <div style={{ textAlign: 'center', marginTop: 12, height: 32 }}>
                {activeObject && (
                  <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>
                    Удалить выбранный объект
                  </Button>
                )}
              </div>
            </div>
          </Content>
          <Sider width={300} theme="light" style={{ overflowY: 'auto' }}>
            <ObjectPropertiesPanel
              object={activeObject}
              onChange={() => forcePropsRerender((n) => n + 1)}
              onDelete={handleDelete}
            />
          </Sider>
        </Layout>
      </Layout>
      <OrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        previewUrl={previewUrl}
        size={size}
      />
    </ConfigProvider>
  );
}

export default App;
