import React, { useState, useEffect } from 'react'
import Editor from '../editor/Editor';
import downloadPDF from "../api/Export";
import { PredictChord } from '../api/Predict';
import usePreserveScroll from '../hooks/usePreserveScroll';

import {
    MdPlayArrow, MdPause, MdStop,
    MdSave, MdDownload, MdDelete,
    MdInsertDriveFile, MdClose, MdSend
} from 'react-icons/md';
import ReproductorIcon from "../components/ReproductorIcon";

export default function Chord() {

    usePreserveScroll();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [file, setFile] = useState(null);
    const [startTime, setStartTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const editor = Editor.getInstance('Editor');

        const handlePlaybackEnded = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        const handlePlaybackStart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        Editor.on('playbackEnded', handlePlaybackEnded);
        Editor.on('playbackStart', handlePlaybackStart);

        return () => {
            Editor.destroy();
        };
    }, []);


    const handlePlay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        const editor = Editor.getInstance('Editor');
        if (editor.isPaused) {
            editor.resume();
        }
        else {
            editor.play();
        }
    };

    const handlePause = () => {
        if (!isPlaying) {
            return;
        }
        setIsPaused(true);
        setIsPlaying(false);
        const editor = Editor.getInstance('Editor');
        editor.pause();
    };

    const handleReset = () => {
        setIsPaused(false);
        setIsPlaying(true);
        const editor = Editor.getInstance('Editor');
        editor.reset();
    };

    const handleStop = () => {
        setIsPlaying(false);
        setIsPaused(false);
        const editor = Editor.getInstance('Editor');
        editor.stop();
    };

    const handlePredict = async () => {
        if (file) {
            const editor = Editor.getInstance('Editor');
            const predictedNotes = await PredictChord(file,startTime);
            console.log(JSON.stringify(predictedNotes));
            editor.loadChord(predictedNotes);
        }
    };

    function handleFileChange(e) {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const audio = new Audio();
        audio.src = URL.createObjectURL(selectedFile);

        audio.addEventListener('loadedmetadata', () => {
            const durMs = Math.floor(audio.duration * 1000);

            const MIN_DURATION_MS = 992;

            if (durMs < MIN_DURATION_MS) {
                alert(`El archivo debe durar al menos ${MIN_DURATION_MS} ms.`);
                setFile(null);
                setDuration(0);
                setStartTime(0);
                return;
            }

            const maxRange = durMs - MIN_DURATION_MS;

            setFile(selectedFile);
            setDuration(maxRange);
            setStartTime(0); 
        });
    }

    return (
        <>
            <div>
                <div className="mt-27">
                    <div className="flex px-10">

                        <div className="flex space-x-50">
                            <div className='ml-10 h-12 flex items-center gap-4'>
                                {!isPlaying && !isPaused && (
                                    <>
                                        <ReproductorIcon icon={MdPlayArrow} onClick={handlePlay} color="text-black" title="Reproducir" />
                                        <ReproductorIcon icon={MdPlayArrow} className={'invisible'} />
                                        <ReproductorIcon icon={MdPlayArrow} className={'invisible'} />
                                    </>
                                )}
                                {isPlaying && (
                                    <>
                                        <ReproductorIcon icon={MdPause} onClick={handlePause} color="text-black" title="Pausar" />
                                        <ReproductorIcon icon={MdStop} onClick={handleReset} color="text-black" title="Reiniciar" />
                                        <ReproductorIcon icon={MdClose} onClick={handleStop} color="text-black" title="Detener" />
                                    </>
                                )}
                                {isPaused && (
                                    <>
                                        <ReproductorIcon icon={MdPlayArrow} onClick={handlePlay} color="text-black" title="Reproducir" />
                                        <ReproductorIcon icon={MdStop} onClick={handleReset} color="text-black" title="Reiniciar" />
                                        <ReproductorIcon icon={MdClose} onClick={handleStop} color="text-black" title="Detener" />
                                    </>
                                )}
                            </div>

                            <div className='h-12 ml-25 flex items-center justify-center gap-4'>
                                <MdDownload
                                    className="text-4xl text-black cursor-pointer"
                                    onClick={() => downloadPDF()}
                                />
                                <MdSend
                                    className="text-4xl text-black cursor-pointer"
                                    onClick={() => handlePredict()}
                                />
                            </div>

                            {file && (
                                <div className="flex text-black items-center gap-2">
                                    <label>{`0 ms`}</label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={duration}
                                        value={startTime}
                                        onChange={(e) => setStartTime(Number(e.target.value))}
                                    />
                                    <label>{`${duration} ms`}</label>
                                    <span className="ml-2 text-sm ">{`Actual: ${startTime} ms`}</span>
                                </div>
                            )}

                            <input
                                className='bg-black ml-10'
                                type='file'
                                accept=".mp3,.wav,.ogg,.flac"
                                onChange={handleFileChange}
                            />

                        </div>
                    </div>

                    <canvas className="mt-30 ml-8 focus:outline-none" id="Editor" width="100" height="100" tabIndex={0} />
                </div>
            </div>
        </>
    )
}
