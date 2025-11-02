import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import '../index.css'
import Left from '../Left.jsx';

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
            <div className="min-h-screen w-screen flex">
                <div className="hidden lg:flex lg:w-1/2 bg-[#141414] items-center justify-center">
                    <Left />
                </div>
                <div className="w-full lg:w-1/2 bg-[#141414] flex items-center justify-center p-8">
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-bold text-white mb-2">Welcome!</h1>
                            <p className="text-gray-400 text-sm">Please enter your details</p>
                        </div>

                        {state === "register" && (
                            <div className="mb-8">
                                <label htmlFor="name" className="block text-gray-400 text-sm mb-2">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    className="w-full bg-transparent border-0 border-b border-gray-600 text-white py-2 focus:outline-none focus:border-white transition-colors placeholder-transparent"
                                    placeholder="name"
                                    required
                                />
                            </div>
                        )}

                        <div className="mb-8">
                            <label htmlFor="email" className="block text-gray-400 text-sm mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                className="w-full bg-transparent border-0 border-b border-gray-600 text-white py-2 focus:outline-none focus:border-white transition-colors placeholder-transparent"
                                placeholder="email"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-400 text-sm mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    className="w-full bg-transparent border-0 border-b border-gray-600 text-white py-2 focus:outline-none focus:border-white transition-colors placeholder-transparent"
                                    placeholder="password"
                                    required
                                />
                                <button
                                    onClick={passVis}
                                    type="button"
                                    className="absolute right-0 top-2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-8 text-sm">
                            <label className="flex items-center text-gray-400">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 mr-2 bg-transparent border-gray-600 rounded"
                                />
                                Remember me
                            </label>
                            <a href="#" className="text-gray-400 hover:text-white">
                                Forgot password?
                            </a>
                        </div>

                        <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-full hover:bg-gray-200 transition-colors mb-4">
                            {state === "register" ? "Create Account" : "Log In"}
                        </button>

                        <button type="button" className="w-full bg-gray-900 text-white font-semibold py-3 rounded-full border border-gray-700 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Log In with Google
                        </button>

                        {state === "register" ? (
                            <p className="text-center text-gray-400 text-sm mt-8">
                                Already have account?{' '}
                                <span onClick={() => setState("login")} className="text-white hover:underline font-semibold cursor-pointer">
                                    click here
                                </span>
                            </p>
                        ) : (
                            <p className="text-center text-gray-400 text-sm mt-8">
                                Don't have an account?{' '}
                                <span onClick={() => setState("register")} className="text-white hover:underline font-semibold cursor-pointer">
                                    Sign Up
                                </span>
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login
