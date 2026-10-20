import { useState, useEffect } from 'react'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { Expand, ImagePlus, X } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import Loading from './Loading'
import toast from 'react-hot-toast'

const Community = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const { axios } = useAppContext()


  useEffect(() => {
    const controller = new AbortController()
    axios.get('/api/user/published-images', { signal: controller.signal })
      .then(({ data }) => {
        if (data.success) setImages(data.images)
        else toast.error(data.message)
      })
      .catch((error) => {
        if (error.name !== 'CanceledError') toast.error(error.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [axios])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setActive(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) return <Loading />
  return (
    <div className="flex-1 p-6 pt-12 xl:px-12 2xl:px-20 w-full mx-auto h-full overflow-y-auto bg-cream dark:bg-coal">
      <div className="max-w-6xl mx-auto">
        <Motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl font-medium tracking-[-0.03em] text-black dark:text-white"
        >
          Community <em className="font-editorial italic">Images</em>
        </Motion.h2>
        <Motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-black/60 dark:text-white/55"
        >
          Published creations from Chatyy creators
        </Motion.p>
        {images.length > 0 ? (
          <div className='mt-8 columns-2 md:columns-3 gap-5 [&>a]:mb-5'>
            {images.map((item, index) => (
              <Motion.button key={index} onClick={() => setActive(item)}
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 26, delay: Math.min(index * 0.05, 0.4) }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className='relative group block w-full rounded-[10px] overflow-hidden border border-black/15 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:border-[#fc7819]/60 dark:hover:border-[#fc7819]/60 hover:shadow-[0_18px_44px_-18px_rgba(28,25,23,0.5)] transition-shadow cursor-pointer text-left'>
                <img src={item.imageUrl} alt={`Created by ${item.userName}`}
                  loading='lazy'
                  className='w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]'></img>
                <span className='absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100' />
                <p className='absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-white opacity-0 transition duration-300 group-hover:opacity-100'>
                  <span>Created by {item.userName}</span>
                  <Expand className="size-3.5 shrink-0" />
                </p>
              </Motion.button>
            ))}
          </div>
        ) : (
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-black/20 px-6 py-16 text-center dark:border-white/15"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fc7819]/15 text-[#fc7819]">
              <ImagePlus className="size-6" />
            </span>
            <p className='mt-4 font-medium text-black dark:text-white'>No images yet</p>
            <p className='mt-2 max-w-[40ch] text-sm text-black/60 dark:text-white/55'>Generate an image and publish it to appear here.</p>
          </Motion.div>
        )}
      </div>

      <AnimatePresence>
      {active && (
        <Motion.dialog
          open
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] m-0 flex h-auto max-h-none w-auto max-w-none items-center justify-center border-0 bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setActive(null)}
          aria-label="Image preview"
        >
          <Motion.figure
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="max-w-3xl w-full rounded-[10px] overflow-hidden border border-white/20 bg-black" onClick={e => e.stopPropagation()}>
            <img src={active.imageUrl} alt={`Created by ${active.userName}`} className="w-full max-h-[75vh] object-contain bg-black" />
            <figcaption className="flex items-center justify-between gap-3 px-5 py-4">
              <p className="text-sm text-white/85">Created by {active.userName}</p>
              <div className="flex items-center gap-3">
                <a href={active.imageUrl} target="_blank" rel="noreferrer" download
                  className="text-sm font-medium text-white underline underline-offset-4 hover:text-white/70 transition-colors">Open full size</a>
                <button onClick={() => setActive(null)} aria-label="Close preview" className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-[#fc7819] hover:text-black">
                  <X className="size-4" />
                </button>
              </div>
            </figcaption>
          </Motion.figure>
        </Motion.dialog>
      )}
      </AnimatePresence>
    </div>
  )
}

export default Community
