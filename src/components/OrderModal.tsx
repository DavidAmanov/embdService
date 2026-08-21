import React, { useState } from 'react';
import { Modal, Typography, Image, Form, Input, Button, Alert } from 'antd';
import { KeychainSize } from '../types/keychain';
import { API_BASE_URL } from '../constants/api';

const { Text, Paragraph } = Typography;

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  previewUrl: string | null;
  size: KeychainSize;
}

interface OrderFormValues {
  name: string;
  contact: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, previewUrl, size }) => {
  const [form] = Form.useForm<OrderFormValues>();
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setSubmitState('idle');
    setErrorMessage(null);
    form.resetFields();
  };

  const handleSubmit = async (values: OrderFormValues) => {
    if (!previewUrl) return;
    setSubmitState('submitting');
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          contact: values.contact,
          sizeLabel: size.label,
          imageBase64: previewUrl,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Не удалось отправить заказ.');
      }
      setSubmitState('success');
    } catch (err) {
      setSubmitState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Не удалось отправить заказ.');
    }
  };

  return (
    <Modal
      title={submitState === 'success' ? 'Заказ отправлен' : 'Оформление заказа'}
      open={open}
      onCancel={handleClose}
      footer={null}
    >
      {previewUrl && (
        <Image src={previewUrl} alt="Превью дизайна" style={{ maxWidth: '100%', marginBottom: 16 }} />
      )}
      <Paragraph>
        Размер ремувки: <Text strong>{size.label}</Text>
      </Paragraph>

      {submitState === 'success' ? (
        <>
          <Alert
            type="success"
            showIcon
            title="Заявка отправлена администратору. С вами свяжутся в ближайшее время."
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" block onClick={handleClose}>
            Понятно
          </Button>
        </>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={submitState === 'submitting'}>
          <Form.Item
            label="Имя"
            name="name"
            rules={[{ required: true, message: 'Укажите имя' }]}
          >
            <Input placeholder="Как к вам обращаться" />
          </Form.Item>
          <Form.Item
            label="Контакт для связи"
            name="contact"
            rules={[{ required: true, message: 'Укажите контакт' }]}
          >
            <Input placeholder="Telegram, ВКонтакте, почта или телефон" />
          </Form.Item>
          {submitState === 'error' && errorMessage && (
            <Alert type="error" showIcon title={errorMessage} style={{ marginBottom: 16 }} />
          )}
          <Button type="primary" htmlType="submit" block loading={submitState === 'submitting'}>
            Отправить
          </Button>
        </Form>
      )}
    </Modal>
  );
};

export default OrderModal;
