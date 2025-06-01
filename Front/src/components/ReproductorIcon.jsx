import React from 'react'

export default function ReproductorIcon({ icon: Icon, className, onClick, color, title }) {
    return (
        <div
            onClick={onClick}
            title={title}
            className={`${className} cursor-pointer border-2 border-black rounded-full p-1.5 ${color} hover:bg-gray-200`}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Icon className="text-3xl" />
        </div>
    );
}
