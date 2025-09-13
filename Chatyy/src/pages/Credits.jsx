import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets, dummyPlans } from '../assets/assets'
import Loading from './Loading'
import Flame from '../icons/Credits'
import toast from 'react-hot-toast'


const Credits = () => {
  const { user } = useAppContext()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const { axios, token } = useAppContext()



  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/api/credit/plan', {
        headers: { Authorization: token }
      })
      if (data.success) {
        setPlans(data.plans)
      } else {
        toast.error(data.message || 'Failed to fetch plans.')
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }


  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post('/api/credit/purchase', { planId }, { headers: { Authorization: token } })
      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }



  useEffect(() => {
    fetchPlans()
  }, [])


  if (loading) return <Loading />


  const handlePurchase = (plan) => {
    console.log('Purchasing plan:', plan)
    alert(`Purchasing ${plan.name} plan for $${plan.price}`)
  }


  return (
    <div className="flex-1 p-6 bg-white dark:bg-gradient-to-b dark:from-[#141414] dark:to-[#000000]  overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Get more credits to unlock the full potential of AI
          </p>


          <div className="inline-flex items-center px-6 py-3 bg-blue-700 dark:bg-blue-800/70 rounded-full">
            <Flame />
            <span className="text-white font-semibold">
              Current Credits: {user?.credits || 0}
            </span>
          </div>
        </div>

        <div className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <h2 className='text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white'>Credit Plans</h2>
          <div className='flex flex-wrap justify-center gap-8'>
            {plans.map((plan) => (
              <div key={plan._id} className={`border border-gray-200 dark:bg-[#313131]/40 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${plan._id === "pro" ? "bg-white dark:bg-[#313131]/10" : "bg-white dark:bg-transparent"}`} >
                <div className='flex-1'>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                </div>
                <p className='text-2xl font-bold text-[#313131]/80 dark:text-white/20 mb-4'>
                  ${plan.price}
                  <span>{' '}/ {plan.credits} credits </span>
                </p>
                <ul className='list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1'>
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button onClick={()=>toast.promise(purchasePlan(plan._id),{loading: 'Processing..'})} className='mt-6 bg-blue-700 dark:bg-blue-800/70 hover:bg-blue-500 active:bg-blue-800 text-white font-medium py-2 rounded transition-colors cursor-pointer '>Buy Now</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


export default Credits
