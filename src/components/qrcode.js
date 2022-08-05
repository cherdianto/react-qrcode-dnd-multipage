import React from 'react'

function Qrcode(props) {
    const { getRef, x, y, angle, width, height } = props
  return (
    <div className="drag-item p-1 qr-code draggable resizable" 
        style={{
            position: 'absolute',
            left: x,
            minWidth: 80,
            top: y,
            width: width,
            // height: height,
            // transform: `rotate(${angle}deg)`,
            border: "2px dashed black",
            boxSizing: "border-box"
        }} 
        ref={getRef}
        >
            <img src="/qrcode.png" alt="dummie qrcode" width={'100%'}/>
    </div>
  )
}

export default Qrcode