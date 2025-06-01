import React from 'react'
import { useState } from 'react';
import { MdEdit, MdDownload, MdDelete, MdArrowDropDown, MdArrowDropUp  } from 'react-icons/md'
import VoiceCard from './VoiceCard';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setIdPartitura } from '../redux/slices/editorSlice';

export default function ObraCard({ id,title, voices, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const onEdit = (id) => {
        dispatch(setIdPartitura(id));
        navigate('/editor');
    }

    return (
        <> 
            <div className='mt-2 w-full flex items-center bg-white py-12 px-8 border-gray-500 border-1 justify-between'>
                <p className='text-black font-medium text-4xl'>
                    {title}
                </p>

                <div className="flex gap-12 text-black text-4xl">
                    <MdEdit className="cursor-pointer" onClick={() => onEdit(id)} />
                    <MdDownload className="cursor-pointer" onClick={() => console.log("Descargar")} />
                    <MdDelete className="cursor-pointer" onClick={() => onDelete()} />
                    {isOpen ? (
                        <MdArrowDropUp className="cursor-pointer" onClick={toggleDropdown} />
                    ) : (
                        <MdArrowDropDown className="cursor-pointer" onClick={toggleDropdown} />
                    )}
                </div>
            </div>

            {isOpen && voices.map((voice, index) => (
                <VoiceCard key={index} title={voice.name} instrument={voice.instrument} />
            ))}
        </>
    )
}
