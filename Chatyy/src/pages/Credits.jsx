import { useEffect, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { useAppContext } from '../context/AppContext'
import Loading from './Loading'
import Flame from '../icons/Credits'
import toast from 'react-hot-toast'


const Credits = () => {
  const { user } = useAppContext()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [buyingId, setBuyingId] = useState(null)
  const { axios, token } = useAppContext()



  const purchasePlan = async (planId) => {
    try {
      setBuyingId(planId)
      const { data } = await axios.post('/api/credit/purchase', { planId }, { headers: { Authorization: token } })
      if (data.success) {
        window.location.assign(data.url)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBuyingId(null)
    }
  }



  useEffect(() => {
    const controller = new AbortController()
    axios.get('/api/credit/plan', {
      headers: { Authorization: token },
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (data.success) setPlans(data.plans)
        else toast.error(data.message || 'Failed to fetch plans.')
      })
      .catch((error) => {
        if (error.name !== 'CanceledError') toast.error(error.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [axios, token])


  if (loading) return <Loading />

  return (
    <div className="flex-1 p-6 bg-cream dark:bg-coal overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-medium tracking-[-0.04em] text-black dark:text-white">
            Choose Your <em className="font-editorial italic">Plan</em>
          </h1>
          <p className="mt-3 text-lg text-black/60 dark:text-white/55">
            Get more credits to unlock the full potential of AI
          </p>

          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.12, type: "spring", stiffness: 300, damping: 24 }}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-ink text-paper dark:bg-[#f5f1e8] dark:text-coal rounded-[10px] shadow-[0_14px_36px_-16px_rgba(28,25,23,0.6)]"
          >
            <Flame className="w-5 dark:invert shrink-0" />
            <span className="font-medium tabular-nums">
              Current Credits: {user?.credits || 0}
            </span>
          </Motion.div>
        </Motion.div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12'>
          <div className='flex flex-wrap justify-center gap-6'>
            {plans.map((plan, i) => {
              const featured = plan._id === "pro"
              return (
                <Motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 26, delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className={`relative rounded-[10px] border p-6 min-w-[300px] max-w-sm flex-1 flex flex-col transition-shadow ${featured ? 'border-[#fc7819]/60 bg-white dark:bg-white/[0.05] shadow-[0_24px_60px_-24px_rgba(252,120,25,0.45)]' : 'border-black/15 dark:border-white/10 bg-white/70 dark:bg-white/[0.03]'}`}>
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full bg-[#fc7819] text-black shadow-sm">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-xl font-medium text-black dark:text-white">{plan.name}</h3>
                  <p className='mt-3 text-3xl font-medium tracking-[-0.03em] text-black dark:text-white'>
                    ${plan.price}
                    <span className='ml-2 text-sm font-normal text-black/60 dark:text-white/55'>{plan.credits} credits</span>
                  </p>
                  <ul className='mt-5 space-y-2 text-sm text-black/60 dark:text-white/55'>
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
                          <path d="M3 8.5 6.5 12 13 4.5" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => purchasePlan(plan._id)} disabled={buyingId === plan._id}
                    className='group relative overflow-hidden mt-6 w-full h-12 bg-ink text-paper dark:bg-[#f5f1e8] dark:text-coal font-medium rounded-[10px] hover:shadow-[0_14px_30px_-14px_rgba(28,25,23,0.7)] disabled:opacity-60 transition-shadow cursor-pointer'>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {buyingId === plan._id ? 'Processing...' : 'Buy Now'}
                  </button>
                </Motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


export default Credits
