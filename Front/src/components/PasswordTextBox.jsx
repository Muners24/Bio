import React from 'react'
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function PasswordTextBox({ className, label, password, setPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <>
            <div className={className}>
                <label className='block text-black'>{label}</label>
                <div className="flex items-center mt-2 bg-white rounded border border-gray-400">
                    <input
                        className='flex-grow text-black px-2 py-1 rounded-l focus:outline-none'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Contraseña'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                        onClick={toggleShowPassword}
                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="px-3 cursor-pointer text-black select-none"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
            </div>
        </>
    )
}
