import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Input } from "../ui/input"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldLabel } from "../ui/field"
import { useState } from "react"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useSearchParams } from "react-router"
import api from "@/service/axios"
import { toast } from "sonner"
import { getErrMessage } from "@/utils/getErrMessage"

const ResetPassword = () => {
    const [showPass, setShowPass] = useState(false);
    const [confirmPass, setConfirmPass] = useState(false);
    const [err, setError] = useState("");
    const [searchParam] = useSearchParams();
    const token = searchParam.get("token");
    const email = searchParam.get("email");
    const navigate = useNavigate();


    const formSchema = z.object({
        password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Password should contain letters, number, special character"),
        confirmPassword: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Password should contain letters, number, special character")
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    })

    const submit = async (data: z.infer<typeof formSchema>) => {
        try {
            if (data.password !== data.confirmPassword) {
                setError("Password not matched with confirm password");
                return;
            }
            const response = await api.post("/api/user/verify-password", { password: data.password, token, email });
            toast.success(response.data.message);
            navigate("/login");
        } catch (err) {
            const msg = getErrMessage(err);
            toast.error(msg);
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center">
            <div className="py-4 px-4 md:px-8">
                <div className="grid max-w-6xl w-full">
                    <div
                        className="border border-slate-300 rounded-lg p-6 max-w-md mx-auto shadow-sm md:p-8 lg:mx-0 dark:border-neutral-700">

                        <div className="mb-8">
                            <h1 className="text-slate-900 text-3xl font-bold mb-4 dark:text-slate-50">Reset Password</h1>
                            <p className="text-slate-600 text-base leading-relaxed dark:text-slate-400">Reset password to access
                                your dashboard and manage your projects.</p>
                        </div>

                        <form className="space-y-6" onSubmit={form.handleSubmit(submit)} method="post">
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
                                                placeholder="Password"
                                                autoComplete="off"
                                                className='h-10'
                                                type={!showPass ? "text" : "password"}
                                            />
                                            <div className='h-1'>
                                                {fieldState.invalid && (
                                                    <div className="group/icon">
                                                        <AlertCircle className="absolute -right-5 top-3 h-4 w-4 text-red-500 cursor-pointer" />

                                                        <div className="absolute right-0 top-9 hidden w-max text-red-500 rounded px-2 py-1 text-xs text-red group-hover/icon:block">
                                                            {fieldState.error?.message}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />
                                <div onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff className='absolute top-2.5 right-2 size-5' /> :
                                        <Eye className='absolute top-2.5 right-2 size-5' />}
                                </div>

                            </div>
                            <div className='relative'>
                                <Controller
                                    name="confirmPassword"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='absolute -top-6 left-1' htmlFor={field.name}>Confirm Password</FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Password"
                                                autoComplete="off"
                                                className='h-10'
                                                type={!confirmPass ? "text" : "password"}
                                            />
                                            <div className='h-1'>
                                                {fieldState.invalid && (
                                                    <div className="group/icon">
                                                        <AlertCircle className="absolute -right-5 top-3 h-4 w-4 text-red-500 cursor-pointer" />

                                                        <div className="absolute right-0 top-9 hidden w-max text-red-500 rounded px-2 py-1 text-xs text-red group-hover/icon:block">
                                                            {fieldState.error?.message}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Field>
                                    )}
                                />
                                <div onClick={() => setConfirmPass(!confirmPass)}>
                                    {confirmPass ? <EyeOff className='absolute top-2.5 right-2 size-5' /> :
                                        <Eye className='absolute top-2.5 right-2 size-5' />}
                                </div>

                            </div>

                            <div>
                                <p>{err}</p>
                            </div>

                            <button type="submit"
                                className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                Reset</button>


                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ResetPassword