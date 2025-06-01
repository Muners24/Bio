import React from 'react'
import { MdWarning } from 'react-icons/md';

export default function RemoveVoiceForm({ voice, obra }) {
    return (
        <>
            <div className='w-1/3 z-260 mt-38 ml-[33.33vw] fixed'>
                <div className='w-full px-10 py-5 bg-gray-400 flex items-center justify-center rounded-t'>
                    <p className='text-black text-2xl'>Eliminar voz</p>
                </div>

                <div className='w-full px-10 py-10 bg-gray-200 rounded-b'>
                    <div className='flex'>
                        <MdWarning className="text-black text-9xl mr-10" />
                        <div className='flex-col'>
                            <p className='text-black text-base'>¿Está seguro que desea eliminar la voz "{voice}" de la obra "{obra}"?</p>
                            <br></br>
                            <p className='text-black text-base'>Esta acción no se puede deshacer.</p>

                        </div>
                    </div>

                    <button className='w-full mt-10'>Eliminar</button>
                </div>
            </div>
        </>
    )
}
