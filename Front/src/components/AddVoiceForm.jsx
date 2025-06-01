import { faL } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { MdArrowDropDown, MdClose } from 'react-icons/md';
import instruments from '../editor/Instruments';

export default function AddVoiceForm({ isOpen, onClose, addVoice }) {
    const [name, setName] = useState('');
    const [instrument, setInstrument] = useState(null);
    const [ddIsOpen, setDdIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            e.stopPropagation();
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        let finalInstrument = instrument;

        if (!instrument) {
            finalInstrument = {...instruments[19]};
            setInstrument(finalInstrument);
        }

        addVoice(name, finalInstrument);
        setName('');
        setInstrument(null);
        setDdIsOpen(false);
        onClose();
    };

    const toggleMenu = () => {
        setDdIsOpen(!ddIsOpen);
    };

    const close = () => {
        onClose();
        setName('');
        setInstrument(null);
        setDdIsOpen(false);
    }

    if (!isOpen) return null;

    return (
        <>
            <div className='fixed inset-0 bg-gray-400 opacity-50 z-1010'></div>
            <div className='fixed top-1/2 left-1/2 w-1/3 z-1020 transform -translate-x-1/2 -translate-y-1/2'>
                <div className='w-full px-5 py-5 bg-gray-400 flex items-center justify-between rounded-t'>
                    <div className="flex-grow flex justify-center">
                        <p className='text-black text-2xl'>Agregar voz</p>
                    </div>
                    <MdClose className='text-black text-3xl cursor-pointer' onClick={close} />
                </div>

                <form onSubmit={handleSubmit} className='w-full px-5 py-10 bg-gray-200 rounded-b'>
                    <label className='text-black'>Nombre</label>
                    <input
                        className='w-full text-black px-2 py-1 mt-1 bg-white rounded border border-gray-400'
                        type='text'
                        placeholder='Nombre de la nueva voz'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <div className="mt-5">
                        <div className="w-full py-2 flex items-center bg-white border border-gray-400 rounded cursor-pointer" onClick={toggleMenu}>
                            <img className='mr-1' src="music_icon.png" alt="Instrumento" />
                            {instrument ? (
                                <p className='text-black'>{instrument.name}</p>
                            ) : (
                                <p className='text-black'>Instrumento</p>
                            )
                            }
                            <MdArrowDropDown className="ml-auto mr-1 text-3xl text-black" />
                        </div>

                        {ddIsOpen && (
                            <div className="w-full mt-3 max-h-[200px] overflow-y-auto flex flex-col px-2 bg-white border border-gray-400 rounded-b">
                                {instruments.map((item, index) => (
                                    <div key={index} className="flex items-center py-2 cursor-pointer"
                                        onClick={() => setInstrument(item)}
                                    >
                                        <div className="text-black">{item.name}</div>
                                        <input
                                            className="ml-auto"
                                            type="radio"
                                            name="instrumento"
                                            checked={instrument === item}
                                            readOnly
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className='w-full mt-10 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition'
                    >
                        Agregar
                    </button>
                </form>
            </div>
        </>
    );
}
