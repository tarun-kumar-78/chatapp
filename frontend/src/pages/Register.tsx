import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import api from '@/service/axios';
import { toast } from 'sonner';
import { getErrMessage } from '@/utils/getErrMessage';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const Register = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const formSchema = z.object({
    name: z.string().min(3, "Name should be more than three characters").max(15, "Name should not greater than 15 characters"),
    email: z.email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Contain alphanumeric characters and special characters"),
    phone: z.string().min(10, "Mobile number contain 10 digits")
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: ""
    }
  })

  const register = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await api.post("/api/auth/signup", data);
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
    <main className="px-4 md:px-8 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div
          className="p-6 rounded-lg bg-white border border-slate-300 shadow-xs md:p-6 dark:bg-neutral-800 dark:border-neutral-700">
          <h1 className="text-slate-900 text-center text-2xl font-bold dark:text-slate-50">Create an account</h1>
          <form className="space-y-6 mt-10" onSubmit={form.handleSubmit(register)}>
            <div className='relative'>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className='absolute -top-6 left-1' htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Name"
                      autoComplete="off"
                      className='h-10'
                      required
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
                      required
                    />
                    <div className='h-1'>
                      {fieldState.invalid && (
                        <div className="group/icon">
                          <AlertCircle className="absolute -right-5  top-3 h-4 w-4 text-red-500 cursor-pointer" />

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
                      required
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
              {showPass ? <EyeOff className='absolute top-2.5 right-3 size-5' onClick={() => setShowPass(!showPass)} /> :
                <Eye className='absolute top-2.5 right-3 size-5' onClick={() => setShowPass(!showPass)} />}
            </div>
            <div className='relative'>
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className='absolute -top-6 left-1' htmlFor={field.name}>Phone</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Mobile"
                      autoComplete="off"
                      className='h-10'
                      required
                    />
                    <div className='h-1'>

                      {fieldState.invalid && (
                        <div className="group/icon">
                          <AlertCircle className="absolute -right-5 top-3 h-4 w-4 text-red-500 cursor-pointer" />

                          <div className="absolute right-0 top-9 hidden w-max rounded px-2 py-1 text-xs text-red group-hover/icon:block">
                            {fieldState.error?.message}
                          </div>
                        </div>
                      )}
                    </div>

                  </Field>
                )}
              />
            </div>
            <button type="submit"
              className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              Create an account</button>
          </form>
          <div className="mt-6 text-slate-900 text-sm text-center dark:text-slate-50">Already have an account? <Link to="/login"
            className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
            Login here</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Register