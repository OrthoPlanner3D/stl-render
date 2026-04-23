import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Stage, useProgress, Html } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Vector3 } from 'three'
import { Play, Pause, Eye, EyeOff, Focus } from 'lucide-react'

import stl_max_1 from './assets/files/1Maxillary.stl'
import stl_max_1_att from './assets/files/1Maxillary_with_attachments.stl'
import stl_max_2 from './assets/files/2Maxillary.stl'
import stl_max_3 from './assets/files/3Maxillary.stl'
import stl_max_4 from './assets/files/4Maxillary.stl'
import stl_max_5 from './assets/files/5Maxillary.stl'
import stl_max_6 from './assets/files/6Maxillary.stl'
import stl_max_7 from './assets/files/7Maxillary.stl'
import stl_max_8 from './assets/files/8Maxillary.stl'
import stl_max_9 from './assets/files/9Maxillary.stl'
import stl_max_10 from './assets/files/10Maxillary.stl'
import stl_max_11 from './assets/files/11Maxillary.stl'
import stl_max_12 from './assets/files/12Maxillary.stl'
import stl_max_13 from './assets/files/13Maxillary.stl'
import stl_max_14 from './assets/files/14Maxillary.stl'
import stl_max_15 from './assets/files/15Maxillary.stl'
import stl_max_16 from './assets/files/16Maxillary.stl'
import stl_man_1 from './assets/files/1Mandibular.stl'
import stl_man_1_att from './assets/files/1Mandibular_with_attachments.stl'
import stl_man_2 from './assets/files/2Mandibular.stl'
import stl_man_3 from './assets/files/3Mandibular.stl'
import stl_man_4 from './assets/files/4Mandibular.stl'
import stl_man_5 from './assets/files/5Mandibular.stl'
import stl_man_6 from './assets/files/6Mandibular.stl'
import stl_man_7 from './assets/files/7Mandibular.stl'
import stl_man_8 from './assets/files/8Mandibular.stl'
import stl_man_9 from './assets/files/9Mandibular.stl'
import stl_man_10 from './assets/files/10Mandibular.stl'
import stl_man_11 from './assets/files/11Mandibular.stl'
import stl_man_12 from './assets/files/12Mandibular.stl'
import stl_man_13 from './assets/files/13Mandibular.stl'
import stl_man_14 from './assets/files/14Mandibular.stl'
import stl_man_15 from './assets/files/15Mandibular.stl'
import stl_man_16 from './assets/files/16Mandibular.stl'

const MAXILLARY = {
  label: 'Maxilar',
  stls: [
    stl_max_1, stl_max_1_att,
    stl_max_2, stl_max_3, stl_max_4, stl_max_5, stl_max_6,
    stl_max_7, stl_max_8, stl_max_9, stl_max_10, stl_max_11,
    stl_max_12, stl_max_13, stl_max_14, stl_max_15, stl_max_16,
  ],
  names: ['1', '1+', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
  filenames: [
    '1Maxillary.stl', '1Maxillary_with_attachments.stl',
    '2Maxillary.stl', '3Maxillary.stl', '4Maxillary.stl', '5Maxillary.stl', '6Maxillary.stl',
    '7Maxillary.stl', '8Maxillary.stl', '9Maxillary.stl', '10Maxillary.stl', '11Maxillary.stl',
    '12Maxillary.stl', '13Maxillary.stl', '14Maxillary.stl', '15Maxillary.stl', '16Maxillary.stl',
  ],
}

const MANDIBULAR = {
  label: 'Mandibular',
  stls: [
    stl_man_1, stl_man_1_att,
    stl_man_2, stl_man_3, stl_man_4, stl_man_5, stl_man_6,
    stl_man_7, stl_man_8, stl_man_9, stl_man_10, stl_man_11,
    stl_man_12, stl_man_13, stl_man_14, stl_man_15, stl_man_16,
  ],
  names: ['1', '1+', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
  filenames: [
    '1Mandibular.stl', '1Mandibular_with_attachments.stl',
    '2Mandibular.stl', '3Mandibular.stl', '4Mandibular.stl', '5Mandibular.stl', '6Mandibular.stl',
    '7Mandibular.stl', '8Mandibular.stl', '9Mandibular.stl', '10Mandibular.stl', '11Mandibular.stl',
    '12Mandibular.stl', '13Mandibular.stl', '14Mandibular.stl', '15Mandibular.stl', '16Mandibular.stl',
  ],
}

const allStls = [...MAXILLARY.stls, ...MANDIBULAR.stls]
allStls.forEach(url => useLoader.preload(STLLoader, url))


function Loader() {
  const { progress } = useProgress()
  return <Html center style={{ color: '#fff', fontSize: 14 }}>{Math.round(progress)}%</Html>
}

function FocusController({ fnRef }: { fnRef: React.MutableRefObject<() => void> }) {
  const { camera, controls } = useThree()
  const savedPos = useRef<Vector3 | null>(null)
  const savedTarget = useRef<Vector3 | null>(null)
  const animating = useRef(false)
  const hasSaved = useRef(false)

  useEffect(() => {
    const ctrl = controls as any
    if (!ctrl || hasSaved.current) return
    const timer = setTimeout(() => {
      savedPos.current = camera.position.clone()
      savedTarget.current = ctrl.target?.clone() ?? new Vector3()
      fnRef.current = () => {
        ctrl.enabled = false
        animating.current = true
      }
      hasSaved.current = true
    }, 800)
    return () => clearTimeout(timer)
  }, [controls, fnRef, camera])

  useFrame(() => {
    if (!animating.current || !savedPos.current || !savedTarget.current) return
    const ctrl = controls as any
    camera.position.lerp(savedPos.current, 0.1)
    ctrl?.target?.lerp(savedTarget.current, 0.1)
    ctrl?.update?.()
    if (camera.position.distanceTo(savedPos.current) < 0.5) {
      camera.position.copy(savedPos.current)
      ctrl?.target?.copy(savedTarget.current)
      ctrl.enabled = true
      ctrl?.update?.()
      animating.current = false
    }
  })

  return null
}

function StlModel({ url, color, visible }: { url: string; color: string; visible: boolean }) {
  const geometry = useLoader(STLLoader, url)
  return (
    <mesh key={url} geometry={geometry} castShadow receiveShadow visible={visible}>
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function StepPanel({ label, names, filenames, index, visible, onSelect }: {
  label: string
  names: string[]
  filenames: string[]
  index: number
  visible: boolean
  onSelect: (i: number) => void
}) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 10px',
      minHeight: 0,
    }}>
      <div style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: visible ? '#555' : '#333',
        marginBottom: 8,
        paddingLeft: 2,
        transition: 'color 0.2s',
      }}>
        {label}
      </div>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: '1fr',
        gap: 4,
      }}>
        {names.map((name, i) => {
          const isActive = i === index
          const isPast = i < index
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              title={filenames[i]}
              style={{
                borderRadius: 6,
                border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                background: isActive
                  ? 'rgba(255,255,255,0.08)'
                  : isPast
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                color: isActive
                  ? '#e0e0e0'
                  : isPast
                    ? '#4a7a4a'
                    : '#333',
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: visible ? 1 : 0.3,
              }}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 100,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(10,10,10,0.75)',
  color: '#999',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.04em',
  transition: 'all 0.2s',
  backdropFilter: 'blur(12px)',
  whiteSpace: 'nowrap',
  pointerEvents: 'auto',
}

export default function App() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showMax, setShowMax] = useState(true)
  const [showMan, setShowMan] = useState(true)
  const [hoverPlay, setHoverPlay] = useState(false)
  const [hoverMax, setHoverMax] = useState(false)
  const [hoverMan, setHoverMan] = useState(false)
  const [hoverFocus, setHoverFocus] = useState(false)
  const [adjustCam, setAdjustCam] = useState<number | false>(2)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const focusFnRef = useRef<() => void>(() => {})
  const total = MAXILLARY.stls.length

  useEffect(() => {
    const t = setTimeout(() => setAdjustCam(false), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setIndex(i => {
          if (i >= total - 1) { setPlaying(false); return i }
          return i + 1
        })
      }, 25)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, total])

  function togglePlay() {
    if (!playing && index === total - 1) setIndex(0)
    setPlaying(p => !p)
  }

  function handleSelect(i: number) {
    setIndex(i)
    setPlaying(false)
  }

  const progress = index / (total - 1)

  return (
    <div style={{
      width: '100%', height: '100vh', background: '#000',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', overflow: 'hidden', position: 'relative',
    }}>
      {/* 3D Canvas — full screen */}
      <div
        style={{ position: 'absolute', inset: 0, cursor: 'grab' }}
        onMouseDown={e => (e.currentTarget.style.cursor = 'grabbing')}
        onMouseUp={e => (e.currentTarget.style.cursor = 'grab')}
        onMouseLeave={e => (e.currentTarget.style.cursor = 'grab')}
      >
        <Canvas shadows frameloop="always" camera={{ fov: 35 }} style={{ height: '100%' }}>
          <Suspense fallback={<Loader />}>
            <Stage environment="city" intensity={0.5} shadows adjustCamera={adjustCam}>
              <FocusController fnRef={focusFnRef} />
              <StlModel url={MAXILLARY.stls[index]} color="#a8aaab" visible={showMax} />
              <StlModel url={MANDIBULAR.stls[index]} color="#a8aaab" visible={showMan} />
            </Stage>
          </Suspense>
          <OrbitControls makeDefault enableDamping dampingFactor={0.15} />
        </Canvas>
      </div>

      {/* Logo + patient — top left */}
      <div style={{
        position: 'absolute', top: 24, left: 24,
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <img src="/assets/logo-white.png" alt="Logo" style={{ height: 72, opacity: 0.85 }} />
        <div style={{ paddingLeft: 2 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: 3 }}>
            Paciente
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', letterSpacing: '0.02em' }}>
            John Wick
          </div>
        </div>
      </div>

      {/* Step panel — right side */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: 88,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        zIndex: 10,
        pointerEvents: 'auto',
      }}>
        <StepPanel
          label="Maxilar"
          names={MAXILLARY.names}
          filenames={MAXILLARY.filenames}
          index={index}
          visible={showMax}
          onSelect={handleSelect}
        />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 10px' }} />
        <StepPanel
          label="Mandibular"
          names={MANDIBULAR.names}
          filenames={MANDIBULAR.filenames}
          index={index}
          visible={showMan}
          onSelect={handleSelect}
        />
      </div>

      {/* Floating controls — bottom center */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        {/* Progress track */}
        <div style={{
          width: 120,
          height: 2,
          borderRadius: 1,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'rgba(255,255,255,0.35)',
            borderRadius: 1,
            transition: 'width 0.05s linear',
          }} />
        </div>

        {/* Button row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Visibility toggle: Maxilar */}
          <button
            onClick={() => setShowMax(v => !v)}
            onMouseEnter={() => setHoverMax(true)}
            onMouseLeave={() => setHoverMax(false)}
            style={{
              ...btnBase,
              color: showMax
                ? (hoverMax ? '#ccc' : '#777')
                : (hoverMax ? '#555' : '#333'),
              background: hoverMax ? 'rgba(30,30,30,0.9)' : btnBase.background,
              borderColor: showMax
                ? (hoverMax ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)')
                : 'rgba(255,255,255,0.06)',
            }}
          >
            {showMax
              ? <Eye size={14} strokeWidth={1.5} />
              : <EyeOff size={14} strokeWidth={1.5} />}
            Maxilar
          </button>

          {/* Play button */}
          <button
            onClick={togglePlay}
            onMouseEnter={() => setHoverPlay(true)}
            onMouseLeave={() => setHoverPlay(false)}
            style={{
              width: 48, height: 48,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: playing
                ? (hoverPlay ? 'rgba(180,50,50,0.85)' : 'rgba(150,40,40,0.8)')
                : (hoverPlay ? 'rgba(30,30,30,0.9)' : 'rgba(10,10,10,0.75)'),
              color: playing ? '#e07070' : (hoverPlay ? '#ccc' : '#999'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              backdropFilter: 'blur(12px)',
              transform: hoverPlay ? 'scale(1.08)' : 'scale(1)',
              pointerEvents: 'auto',
            }}
          >
            {playing
              ? <Pause size={18} strokeWidth={1.5} />
              : <Play size={18} strokeWidth={1.5} style={{ marginLeft: 2 }} />}
          </button>

          {/* Visibility toggle: Mandibular */}
          <button
            onClick={() => setShowMan(v => !v)}
            onMouseEnter={() => setHoverMan(true)}
            onMouseLeave={() => setHoverMan(false)}
            style={{
              ...btnBase,
              color: showMan
                ? (hoverMan ? '#ccc' : '#777')
                : (hoverMan ? '#555' : '#333'),
              background: hoverMan ? 'rgba(30,30,30,0.9)' : btnBase.background,
              borderColor: showMan
                ? (hoverMan ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)')
                : 'rgba(255,255,255,0.06)',
            }}
          >
            {showMan
              ? <Eye size={14} strokeWidth={1.5} />
              : <EyeOff size={14} strokeWidth={1.5} />}
            Mandibular
          </button>

          {/* Focus / reset camera */}
          <button
            onClick={() => focusFnRef.current()}
            onMouseEnter={() => setHoverFocus(true)}
            onMouseLeave={() => setHoverFocus(false)}
            title="Volver a posición inicial"
            style={{
              ...btnBase,
              padding: '8px 12px',
              color: hoverFocus ? '#ccc' : '#777',
              background: hoverFocus ? 'rgba(30,30,30,0.9)' : btnBase.background,
            }}
          >
            <Focus size={14} strokeWidth={1.5} />
            Focus
          </button>
        </div>

        {/* Step counter */}
        <span style={{
          fontSize: 10,
          color: '#444',
          letterSpacing: '0.08em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {MAXILLARY.names[index]} / {MAXILLARY.names[total - 1]}
        </span>
      </div>
    </div>
  )
}
