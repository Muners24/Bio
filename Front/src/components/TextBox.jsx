import React from 'react'

export default function TextBox({ className, label, text, placeholder, setText }) {
    return (
        <>
            <div className={className}>
                <label className='block text-black'>{label}</label>
                <input
                    className='w-full text-black px-2 py-1 mt-2 bg-white rounded border border-gray-400'
                    type='text'
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
        </>
    )
}
