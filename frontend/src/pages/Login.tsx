import bg from '@/assets/bg.jpg'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import chatappImage from '@/assets/chatapp-image.jpg'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import api from '@/service/axios'
import { toast } from 'sonner'
import { getErrMessage } from '@/utils/getErrMessage'


const Login = () => {
    const navigate = useNavigate();
    const formSchema = z.object({
        email: z.email(),
        password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Password should contain uppercase,lowercase, number, special character")
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const response = await api.post("/api/auth/login", data);
            if (response.data?.success) {
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
                <div className='flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-black/40 md:flex-row'>
                    <div style={{ backgroundImage: `url(${chatappImage})` }} className='relative hidden md:flex bg-center bg-cover w-1/2'>
                        <Button variant="link" className="absolute top-4 left-4 text-white">Back to website</Button>
                    </div>
                    <div className='w-full p-6 md:w-1/2'>
                        <h2 className='text-2xl text-center text-white'>Login</h2>
                        <p className="mt-1 text-center text-xs text-white">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="underline text-blue-400 hover:text-blue-300"
                            >
                                Register
                            </Link>
                        </p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>

                                            <FormControl>
                                                <Input placeholder="Enter email" className='text-white' {...field} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>

                                            <FormControl>
                                                <Input placeholder="Enter password" className='text-white' {...field} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className='w-full bg-white hover:bg-white/90 text-black cursor-pointer'>Login</Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Login