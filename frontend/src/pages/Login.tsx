import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import api from "@/service/axios"
import { getErrMessage } from "@/utils/getErrMessage"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import z from "zod"

const Login = () => {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
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

    const login = async (data: z.infer<typeof formSchema>) => {
        try {
            const response = await api.post("/api/auth/login", data);
            if (response.data.success) {
                navigate("/");
                toast.success(response.data.message);
            }
        } catch (err) {
            const errMsg = getErrMessage(err);
            toast.error(errMsg);
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center">
            <div className="py-4 px-4 md:px-8">
                <div className="grid max-w-6xl w-full">
                    <div
                        className="border border-slate-300 rounded-lg p-6 max-w-md mx-auto shadow-sm md:p-8 lg:mx-0 dark:border-neutral-700">

                        <div className="mb-8">
                            <h1 className="text-slate-900 text-3xl font-bold mb-4 dark:text-slate-50">Sign in</h1>
                            <p className="text-slate-600 text-base leading-relaxed dark:text-slate-400">Sign in to your account to access
                                your dashboard and manage your projects.</p>
                        </div>

                        <form className="space-y-6" onSubmit={form.handleSubmit(login)} method="post">
                            <div className='relative mb-10'>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='absolute -top-6 left-1' htmlFor={field.name}>Email</FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="john@gmail.com"
                                                autoComplete="off"
                                                className='h-10'
                                            />
                                            <div className="min-h-4 -mt-2 ml-1">
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />
                            </div>
                            <div className='relative'>
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='absolute -top-6 left-1' htmlFor={field.name}>Password</FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Enter password"
                                                autoComplete="off"
                                                className='h-10'
                                                type={!showPass ? "text" : "password"}
                                            />
                                            <div className="min-h-4 -mt-2 ml-1">
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />
                                {showPass ? <EyeOff className='absolute top-2.5 right-2 size-5' onClick={() => setShowPass(!showPass)} /> :
                                    <Eye className='absolute top-2.5 right-2 size-5' onClick={() => setShowPass(!showPass)} />}

                            </div>
                            <div className="flex items-start flex-wrap gap-2">
                                <a href="#"
                                    className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                                    Forgot password?
                                </a>
                            </div>

                            <button type="submit"
                                className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                Sign in</button>

                            <div className="text-slate-900 text-sm text-center dark:text-slate-50">Don't have an account? <Link to="/register"
                                className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Sign
                                up</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Login