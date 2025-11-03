import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import '../index.css'
import Background from '../components/fluid';

function Login() {
    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { axios, setToken } = useAppContext()

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = state === "login" ? '/api/user/login' : '/api/user/register'

        try {
            const { data } = await axios.post(url, { name, email, password })

            if (data.success) {
                setToken(data.token)
                localStorage.setItem('token', data.token)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const passVis = () => {
        setShowPassword(!showPassword);
    }

    return (
        <>
            <Background />
            <div className="relative z-10 min-h-screen w-screen flex">
                <div className="w-[55%] h-screen" />

                <div className="w-[45%] h-screen flex items-center justify-center p-6 pr-12">
                    <div className="w-full max-w-sm bg-[#1a1a1a]/60 rounded-2xl p-10 shadow-2xl">
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="mb-12">
                                <h1 className="text-[26px] font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Inter','Geist',system-ui,sans-serif" }}>Welcome!</h1>
                                <p className="text-sm text-neutral-500 font-bold" style={{ fontFamily: "'Inter','Geist',system-ui,sans-serif" }}>Please enter your details</p>
                            </div>

                            {state === "register" && (
                                <div className="mb-8">
                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-[2px] mb-4">Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            onChange={(e) => setName(e.target.value)}
                                            value={name}
                                            className="w-full bg-transparent text-white text-sm py-3 pl-0 pr-2 border-0 border-b border-neutral-800 focus:border-neutral-600 focus:outline-none transition-colors placeholder-neutral-600"
                                            placeholder="name"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-[2px] mb-4">Email</label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        className="w-full bg-transparent text-white text-sm py-3 pl-0 pr-2 border-0 border-b border-neutral-800 focus:border-neutral-600 focus:outline-none transition-colors placeholder-neutral-600"
                                        placeholder="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-[2px] mb-4">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        className="w-full bg-transparent text-white text-sm py-3 pl-0 pr-8 border-0 border-b border-neutral-800 focus:border-neutral-600 focus:outline-none transition-colors placeholder-neutral-600"
                                        placeholder="password"
                                        required
                                    />
                                    <button
                                        onClick={passVis}
                                        type="button"
                                        className="absolute right-0 bottom-3 text-neutral-600 hover:text-neutral-400 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-10">
                                <label className="flex items-center text-neutral-500 text-xs cursor-pointer hover:text-neutral-400 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 mr-2.5 accent-white bg-transparent border border-neutral-700 rounded"
                                    />
                                    <span className="font-bold">Remember me</span>
                                </label>
                            </div>

                            <button type="submit" className="w-full bg-white text-black text-sm font-bold py-3.5 rounded-lg hover:bg-neutral-200 transition-all active:scale-[0.98] mb-4">
                                {state === "register" ? "Create Account" : "Log In"}
                            </button>

                            {state === "register" ? (
                                <p className="text-center text-neutral-500 text-xs font-bold mt-8">
                                    Already have account?{' '}
                                    <span onClick={() => setState("login")} className="text-white font-bold hover:opacity-80 cursor-pointer transition-opacity">
                                        click here
                                    </span>
                                </p>
                            ) : (
                                <p className="text-center text-neutral-500 text-xs font-bold mt-8">
                                    Don't have an account?{' '}
                                    <span onClick={() => setState("register")} className="text-white font-bold hover:opacity-80 cursor-pointer transition-opacity">
                                        Sign Up
                                    </span>
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login
