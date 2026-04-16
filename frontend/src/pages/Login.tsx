import bg from '@/assets/bg.jpg'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import loginImg from '@/assets/pexels-lostintespace-14220392.jpg'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import api from '@/service/axios'
import { toast } from 'sonner'
import { getErrMessage } from '@/utils/getErrMessage'
import { useDispatch } from 'react-redux'
import { setLogin } from '@/store/auth/authSlice'
import Google from '@/assets/Google.png'
import { useState } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react'


const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const formSchema = z.object({
        username: z.string().min(3, "Invalid username"),
        password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Contain alphanumeric and special character")
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const response = await api.post("/api/auth/login", data);
            if (response.data?.success) {
                dispatch(setLogin(true));
                navigate("/");
                toast.success(response.data.message);
            }
        } catch (err) {
            const errMsg = getErrMessage(err);
            toast.error(errMsg);
        }
    }

    return (
        <div style={{ backgroundImage: `url(${bg})` }} className="relative min-h-screen bg-cover bg-center">
            <div className='absolute inset-0 bg-black/30 backdrop-blur-sm'></div>
            <div className='relative z-10 flex items-center justify-center min-h-screen px-4'>
                <div className='flex items-center justify-center gap-3 w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden p-3'>
                    <section className='hidden md:block md:w-1/2 overflow-hidden rounded-md'>
                        <img src={loginImg} alt="login image" className='h-full w-full object-cover rounded-md' />
                    </section>
                    <section className='min-w-1/2 p-3 flex flex-col gap-4'>
                        <div>
                            <h1 className='text-3xl md:text-4xl font-semibold mb-1'>Login</h1>
                            <p className='text-sm text-gray-400'>Don't have an account? <Link to="/register" className='text-blue-600 underline'>Register</Link></p>
                        </div>
                        <Form {...form}>
                            <form method='post' className='flex flex-col' onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>

                                            <FormControl className='h-10 focus:shadow-md transition duration-500 ease-in-out'>
                                                <Input placeholder="Username" {...field} />
                                            </FormControl>
                                            <div className="min-h-5">
                                                <FormMessage className="text-xs" />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <>
                                                <div className='relative'>
                                                    <FormControl className='h-10 focus:shadow-md transition duration-500 ease-in-out'>
                                                        <Input type={showPass ? "text" : "password"} placeholder="Password" {...field} />
                                                    </FormControl>
                                                    <div onClick={() => setShowPass(!showPass)}>

                                                        {showPass ? <EyeIcon className='absolute right-2 top-2.5 h-5 w-5 cursor-pointer' />
                                                            : <EyeOff className='absolute right-2 top-2.5 h-5 w-5 cursor-pointer' />}
                                                    </div>
                                                </div>
                                                <div className="min-h-5">
                                                    <FormMessage className="text-xs" />
                                                </div>
                                            </>
                                        </FormItem>
                                    )}
                                />
                                <Button type='submit' className='mt-3 h-10 cursor-pointer' variant="default">Login</Button>
                            </form>
                        </Form>
                        <div className='h-10 border border-black flex items-center justify-center gap-3 rounded-md cursor-pointer font-semibold'>
                            <img src={Google} alt="google logo" className='h-6 w-6' />
                            Login with Google

                        </div>
                    </section>
                </div>
            </div>
        </div>

    )
}

export default Login