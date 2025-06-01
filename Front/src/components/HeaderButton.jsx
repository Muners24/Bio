import React from 'react'
import { Link } from 'react-router-dom'

export default function HeaderButton({ className = '', label, url , onClick = (() => {}) }) {
    return (
        <>
            <div className={className}>
                <Link to={url}>
                    <button 
                        className="w-35 text-white hover:text-gray-300 font-medium"
                        onClick={onClick}
                    >{label}
                    </button>
                </Link>
            </div>
        </>
    )
}
