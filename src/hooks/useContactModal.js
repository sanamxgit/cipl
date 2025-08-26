import { useState } from 'react';

const useContactModal = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  const openContactModal = () => setShowContactModal(true);
  const closeContactModal = () => setShowContactModal(false);

  return {
    showContactModal,
    openContactModal,
    closeContactModal
  };
};

export default useContactModal;
