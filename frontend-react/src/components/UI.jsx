import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export default function Toast() {
  return null; // Toast is handled by the global hook
}

// Global toast state
let _showToast = () => {};
export function showToast(msg, type = '') {
  _showToast(msg, type);
}

export function ToastContainer() {
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const timer = useRef(null);

  useEffect(() => {
    _showToast = (msg, type) => {
      setToast({ msg, type, show: true });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
    };
  }, []);

  return (
    <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
      {toast.msg}
    </div>
  );
}

// Modal
let _setModalContent = () => {};
let _openModal = () => {};
let _closeModal = () => {};

export function openModal(content, wide = false) {
  _setModalContent({ content, wide });
  _openModal();
}
export function closeModal() { _closeModal(); }

export function ModalContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState({ content: null, wide: false });

  useEffect(() => {
    _setModalContent = setModal;
    _openModal = () => setIsOpen(true);
    _closeModal = () => setIsOpen(false);
  }, []);

  return (
    <div className={`modal-bg ${isOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
      <div className={`modal ${modal.wide ? 'modal-wide' : ''}`}>
        {modal.content}
      </div>
    </div>
  );
}

// Lightbox
let _openLightbox = () => {};
let _closeLightbox = () => {};

export function openLightboxFn(src) { _openLightbox(src); }
export function closeLightboxFn() { _closeLightbox(); }

export function LightboxContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const [src, setSrc] = useState('');

  useEffect(() => {
    _openLightbox = (s) => { setSrc(s); setIsOpen(true); };
    _closeLightbox = () => setIsOpen(false);
  }, []);

  return (
    <div className={`lightbox ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
      <button className="lightbox-close" onClick={() => setIsOpen(false)}>✕</button>
      <img src={src} alt="" />
    </div>
  );
}
