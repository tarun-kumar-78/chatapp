import { AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/service/axios"
import { getErrMessage } from "@/utils/getErrMessage"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import z from "zod"

const Login = () => {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [email, setEmail] = useState("");
    const [err, setError] = useState("");
    const timerRef = useRef<number>(60);
    const intervalRef = useRef(0);
    const [seconds, setSeconds] = useState(0);
    const formSchema = z.object({
        email: z.email(),
        password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Password should contain letters, number, special character")
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

    const handleResetPassword = async () => {
        try {
            if (!email) {
                setError("Email is required");
                return;
            }
            if (!email.includes("@gmail.com")) {
                setError("Enter a valid email");
                return;
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            timerRef.current = 60;
            intervalRef.current = setInterval(() => {
                timerRef.current -= 1;
                setSeconds(timerRef.current);
                if (timerRef.current <= 0) clearInterval(intervalRef.current);
            }, 1000);
            setError("");
            const response = await api.post("/api/user/reset-password", { email });
            if (response.data.success) {
                toast.success(response.data.message);
                setOpenDialog(false);
                setEmail("");
            }
        } catch (err) {
            const msg = getErrMessage(err);
            toast.error(msg);
        }
    }

    const handleDialogClose = () => {
        setOpenDialog(false);
        setEmail("");
        setError("");
        clearInterval(intervalRef.current);
        setSeconds(0);
        timerRef.current = 0;
    }

    return (
        <>
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
                                <div className='relative'>
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
                                                    placeholder="Email"
                                                    autoComplete="off"
                                                    className='h-10'
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
                                    {showPass ? <EyeOff className='absolute top-2.5 right-2 size-5' onClick={() => setShowPass(!showPass)} /> :
                                        <Eye className='absolute top-2.5 right-2 size-5' onClick={() => setShowPass(!showPass)} />}

                                </div>
                                <div className="flex items-start flex-wrap gap-2">
                                    <Link to="#" onClick={() => setOpenDialog(true)}
                                        className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                                        Forgot password?
                                    </Link>
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

            {/*  Reset Password Dialog */}
            <Dialog open={openDialog}>
                <form>
                    <DialogContent className="sm:max-w-sm [&_.ring-offset-background]:hidden">
                        <AlertDialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription></DialogDescription>
                        </AlertDialogHeader>
                        <FieldGroup>
                            <Field className="relative">
                                <Label htmlFor="name-1">Email</Label>
                                <Input required id="name-1" name="name" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                                <div className="group/icon">
                                    {err && <AlertCircle className="absolute right-2 top-1/2 h-4 w-4 text-red-500 cursor-pointer" />}

                                    <div className="absolute right-0 -bottom-2 hidden w-max text-red-500 rounded px-2 py-1 text-xs text-red group-hover/icon:block">
                                        {err}
                                    </div>
                                </div>
                            </Field>
                        </FieldGroup>
                        <AlertDialogFooter className="my-3">
                            <Button onClick={handleDialogClose} className="hover:bg-black cursor-pointer w-1/2">Close</Button>
                            <Button type="submit" className={`bg-blue-700 hover:bg-blue-700 cursor-pointer w-1/2 ${seconds ? "opacity-65 cursor-not-allowed" : ""}`} onClick={handleResetPassword}>{seconds === 0 ? "Verify" : seconds}</Button>
                        </AlertDialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </>
    )
}

export default Login