import React from 'react';
import { MdEdit, MdDownload, MdDelete, MdArrowDropDown } from 'react-icons/md';

export default function VoiceCard({ title, instrument }) {
  return (
    <>
      <div className='mt-1 w-full flex py-6 bg-white  items-center px-8 border-gray-500 border-1 justify-between'>
        <div className='flex-col'>
          <p className='text-black font-medium text-3xl'>
            {title}
          </p>
          <p className='mt-3 text-gray-600 text-2xl'>
            Voz {instrument.name}
          </p>
        </div>

        <div className="flex gap-12 text-black text-4xl">
          <MdEdit className="cursor-pointer" onClick={() => console.log("Editar")} />
          <MdDownload className="cursor-pointer" onClick={() => console.log("Descargar")} />
          <MdDelete className="cursor-pointer" onClick={() => console.log("Borrar")} />
          <MdDelete className="invisible" />
        </div>
      </div>
    </>
  )
}
