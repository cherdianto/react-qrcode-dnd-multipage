import React from 'react'

function Qrtitle(props) {
    const { getRef, x, y, width, height } = props
  return (
    <div className="drag-item p-1" 
        style={{
            position: 'absolute',
            left: x,
            minWidth: 80,
            minHeight: 60,
            top: y,
            width: width,
            height: height,
            // transform: `rotate(${angle}deg)`,
            border: "2px dashed black",
            boxSizing: "border-box",
            zIndex: 100
        }} 
        ref={getRef}
        >
            <p style={{fontSize: '100%' }}>Scan disini</p>
    </div>
  )
}

export default Qrtitle