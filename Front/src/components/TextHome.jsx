import React from 'react'

export default function TextHome({ className,text}) {
  return (
    <>
        <div className={className}>
            <p className="max-w-150 text-2xl text-black">{text}</p>
        </div>
    </>
  )
}
