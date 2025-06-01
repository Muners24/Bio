import React, { useState, useEffect } from 'react';
import { MdArrowDropDown, MdAdd } from 'react-icons/md';
import Voice from './Voice';
import Editor from '../editor/Editor';
import AddVoiceForm from './AddVoiceForm';

export default function Voices() {
    const [isOpen, setIsOpen] = useState(false);
    const [voices, setVoices] = useState([]);
    const [modalAddVoiceOpen, setModalAddVoiceOpen] = useState(false);

    useEffect(() => {
        const editor = Editor.getInstance();
        setVoices([...editor.voices]);

        return () => {
            console.log("ddestruyendo voces");
        };
    }, []);

    const updateVoices = () => {
        const editor = Editor.getInstance();
        setVoices([...editor.voices]);
    }

    const addVoice = (name, instrument) => {
        const editor = Editor.getInstance();
        editor.addVoice(name, instrument);
        updateVoices();
    }

    const deleteVoice = (voice) => {
        const editor = Editor.getInstance();
        editor.deleteVoice(voice)
        updateVoices();
    }

    const onRename = (newName, voice) => {
        voice.rename(newName);
        updateVoices();
    }

    const onUp = (voice) => {
        const editor = Editor.getInstance();
        editor.swapVoiceUp(voice);
        updateVoices();
    }

    const onDown = (voice) => {
        const editor = Editor.getInstance();
        editor.swapVoiceDown(voice);
        updateVoices();
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        updateVoices();
    };

    const toggleVisibility = (voice) => {
        voice.toggleVisibility();
        updateVoices();
    }

    const toggleMute = (voice) => {
        voice.toggleMute();
        updateVoices();
    }

    return (
        <>
            <AddVoiceForm
                addVoice={addVoice}
                isOpen={modalAddVoiceOpen}
                onClose={() => setModalAddVoiceOpen(false)}
            />
            <div className="w-2/5 relative">
                <div className="h-12 flex items-center justify-between bg-white border-gray-700 border-3">
                    <p className="ml-5 text-black font-medium">Voces</p>
                    <MdArrowDropDown
                        className="mr-5 text-3xl text-black cursor-pointer"
                        onClick={toggleMenu}
                    />
                </div>

                {isOpen && (
                    <div className="flex-col ml-0 mt-1.5 h-auto flex items-center justify-between bg-white border-gray-700 border-3 absolute top-full left-0 w-full z-30">
                        {voices.map((voice, index) => (
                            <Voice
                                key={index}
                                voice={voice}
                                onRename={(newName) => onRename(newName, voice)}
                                onToggleVisibility={() => { toggleVisibility(voice) }}
                                onToggleMute={() => { toggleMute(voice) }}
                                deleteVoice={() => deleteVoice(voice)}
                                up={index !== 0}
                                down={index !== voices.length - 1}
                                onUp={() => onUp(voice)}
                                onDown={() => onDown(voice)}
                            />
                        ))}

                        <div className="w-full h-12 flex justify-center items-center bg-white border-t border-gray-700">
                            <MdAdd
                                className="text-2xl text-black cursor-pointer"
                                onClick={() => setModalAddVoiceOpen(true)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
