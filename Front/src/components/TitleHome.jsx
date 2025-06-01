import React from 'react'

export default function TitleHome({className, text}) {
  return (
    <>
        <div className={className}>
            <p className="text-3xl text-black font-medium">{text}</p>
        </div>
    </>
  )
}
