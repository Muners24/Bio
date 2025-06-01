import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEye, FaEyeSlash, FaVolumeMute, FaVolumeUp, FaTrash } from 'react-icons/fa';
import instruments from '../editor/Instruments';
import { Icon } from '@iconify/react';
import { Instrument } from 'tone/build/esm/instrument/Instrument';

const instrumentIcons = {
    'acordeón': 'mdi:accordion',
    'arpa': 'mdi:harp',
    'bajo acústico': 'mdi:guitar-electric', // no hay específico acústico, usa uno genérico
    'bajo eléctrico': 'mdi:guitar-electric',
    'banjo': 'mdi:banjo',
    'caja de música': 'mdi:music-box',
    'clarinete': 'mdi:clarinet',
    'clavecín': 'mdi:piano', // no hay clavecín, piano como fallback
    'contrabajo': 'mdi:guitar-electric',
    'fagot': 'mdi:music-note', // sin icono específico
    'flauta': 'mdi:flute',
    'flauta de pan': 'mdi:flute',
    'gaita': 'mdi:bag-personal',
    'guitarra clásica': 'mdi:guitar-acoustic',
    'guitarra eléctrica': 'mdi:guitar-electric',
    'marimba': 'mdi:music-note',
    'oboe': 'mdi:music-note',
    'ocarina': 'mdi:music-note',
    'órgano': 'mdi:church',
    'piano': 'mdi:piano',
    'saxofón': 'mdi:saxophone',
    'corno frances': 'mdi:horn',
    'trombón': 'mdi:trombone',
    'trompeta': 'mdi:trumpet',
    'tuba': 'mdi:tuba',
    'vibráfono': 'mdi:music-note',
    'viola': 'mdi:violin',
    'violín': 'mdi:violin',
    'cello': 'mdi:violin',
    'xilófono': 'mdi:music-note',
};

export default function Voice({ voice, onRename, onToggleVisibility, onToggleMute, deleteVoice, up, down, onUp, onDown }) {

    return (
        <div className='w-full flex justify-between items-center p-2 border-t border-gray-700'>
            <div className='flex flex-col justify-between h-16'>
                <FaChevronUp
                    className={`${up ? 'text-black' : 'text-gray-500'} cursor-pointer`}
                    onClick={onUp}
                />
                <FaChevronDown
                    className={`${down ? 'text-black' : 'text-gray-500'} cursor-pointer`}
                    onClick={onDown}
                />
            </div>

            <div className="ml-2 w-24 text-center">
                <p className="text-black font-medium text-sm">{voice.instrument.name}</p>
                <Icon icon={
                    instrumentIcons[voice.instrument.name.toLowerCase()] || 'mdi:music'
                } width="50" height="50" className="text-black mx-auto" />
            </div>

            <input
                type="text"
                value={voice.name}
                onChange={(e) => {
                    const newName = e.target.value;
                    onRename(newName);
                }}
                className="ml-2 text-black font-medium bg-transparent border-none focus:outline-none w-auto min-w-[4ch]"
            />

            <div className='flex flex-col flex-grow px-4' />

            <div className='flex space-x-4 text-3xl text-black'>
                <span
                    onClick={() => onToggleVisibility()}
                    title={voice.name ? "Ocultar" : "Mostrar"}
                    className="cursor-pointer"
                >
                    {voice.visibility ? <FaEye /> : <FaEyeSlash />}
                </span>

                <span
                    onClick={() => onToggleMute()}
                    title={voice.mute ? "Desmutear" : "Mutear"}
                    className="cursor-pointer"
                >
                    {voice.mute ? <FaVolumeMute /> : <FaVolumeUp />}
                </span>

                <span
                    onClick={() => deleteVoice()}
                    title={"Eliminar voz"}
                    className="cursor-pointer"
                >
                    <FaTrash />
                </span>

            </div>
        </div>
    );
}
