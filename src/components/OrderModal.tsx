import React from 'react';
import { Modal, Typography, Image } from 'antd';
import { KeychainSize } from '../types/keychain';

const { Text, Paragraph } = Typography;

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  previewUrl: string | null;
  size: KeychainSize;
}

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, previewUrl, size }) => {
  return (
    <Modal title="Заказ отправлен" open={open} onCancel={onClose} onOk={onClose} okText="Понятно">
      <Paragraph>
        Ваш дизайн ремувки размером <Text strong>{size.label}</Text> сохранён. Отправка в
        обработку (интеграция с Telegram) будет подключена позже.
      </Paragraph>
      {previewUrl && (
        <Image src={previewUrl} alt="Превью дизайна" style={{ maxWidth: '100%' }} />
      )}
    </Modal>
  );
};

export default OrderModal;
