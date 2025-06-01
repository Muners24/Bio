import React, { useRef, useState, useEffect } from 'react';

export default function TextBoxEditor({ text, placeholder, setText }) {
  const spanRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      inputRef.current.style.width = `${spanRef.current.offsetWidth + 10}px`; 
    }
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="relative inline-flex">
      <input
        type="text"
        ref={inputRef}
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        className="text-black text-2xl font-medium border-b border-gray-500 rounded px-2 py-1 transition-all duration-100 focus:outline-none focus:ring-0"
        style={{ minWidth: '60px' }}
        tabIndex={-1}
      />

      <span
        ref={spanRef}
        className="absolute top-0 left-0 invisible whitespace-pre px-2 py-1 font-medium text-2xl" // Asegúrate de que el font-size sea el mismo
      >
        {text || placeholder}
      </span>
    </div>
  );
}
