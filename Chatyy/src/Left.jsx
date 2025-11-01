import React, { useState, useEffect, useRef } from 'react'

const Left = (props) => {
  const { backgroundColor = '#d1d1d1' } = props
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const Eye = ({ x, y, size = 20 }) => {
    const eyeRef = useRef(null)
    const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 })

    useEffect(() => {
      if (eyeRef.current) {
        const rect = eyeRef.current.getBoundingClientRect()
        const eyeCenterX = rect.left + rect.width / 2
        const eyeCenterY = rect.top + rect.height / 2
        
        const angle = Math.atan2(mousePos.y - eyeCenterY, mousePos.x - eyeCenterX)
        const distance = Math.min(6, Math.hypot(mousePos.x - eyeCenterX, mousePos.y - eyeCenterY) / 50)
        
        setPupilPos({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        })
      }
    }, [mousePos, x, y, size])

    return (
      <div
        ref={eyeRef}
        className="absolute rounded-full bg-white flex items-center justify-center "
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`
        }}
      >
        <div
          className="rounded-full bg-black"
          style={{
            width: `${size * 0.4}px`,
            height: `${size * 0.4}px`,
            transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex items-center justify-center overflow-hidden bg-[#141414]"
    >
      <div className="relative" style={{ width: '600px', height: '600px' }}>
        {/* #1E90FF */}
        <div
          className="absolute"
          style={{
            left: '180px',
            top: '100px',
            width: '200px',
            height: '350px',
            backgroundColor: '#1E90FF',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
        >
          <Eye x={40} y={50} size={24} />
          <Eye x={110} y={50} size={24} />
          <div
            className="absolute bg-black"
            style={{
              left: '70px',
              top: '100px',
              width: '40px',
              height: '8px',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* #C0C0C0 */}
        <div
          className="absolute"
          style={{
            left: '320px',
            top: '220px',
            width: '180px',
            height: '280px',
            backgroundColor: '#C0C0C0',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          <Eye x={45} y={40} size={22} />
          <Eye x={105} y={40} size={22} />
        </div>

        {/* #004D61*/}
        <div
          className="absolute"
          style={{
            left: '80px',
            top: '320px',
            width: '240px',
            height: '240px',
            backgroundColor: '#004D61',
            borderRadius: '120px 120px 0 0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}
        >
          <Eye x={50} y={80} size={20} />
          <Eye x={170} y={80} size={20} />
          <div
            className="absolute bg-black"
            style={{
              left: '80px',
              top: '130px',
              width: '60px',
              height: '40px',
              borderRadius: '0 0 30px 30px'
            }}
          />
        </div>

        {/* #FFEB3B*/}
        <div
          className="absolute"
          style={{
            left: '420px',
            top: '280px',
            width: '140px',
            height: '220px',
            backgroundColor: '#FFEB3B',
            borderRadius: '70px 70px 20px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
        >
          <div
            className="absolute rounded-full bg-black"
            style={{
              left: '60px',
              top: '50px',
              width: '10px',
              height: '10px'
            }}
          />
          <div
            className="absolute bg-black"
            style={{
              left: '30px',
              top: '100px',
              width: '80px',
              height: '4px',
              borderRadius: '2px'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Left
