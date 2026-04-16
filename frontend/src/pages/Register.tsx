import bg from '@/assets/bg.jpg';
import regImg from '@/assets/pexels-lostintespace-14220392.jpg';
import { Button } from '@/components/ui/button';
import Google from '@/assets/Google.png'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import api from '@/service/axios';
import { toast } from 'sonner';
import { getErrMessage } from '@/utils/getErrMessage';
import { EyeIcon, EyeOff } from 'lucide-react';
import { useState } from 'react';

const Register = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const formSchema = z.object({
    name: z.string().min(3, "Name should be more than three characters").max(15, "Name should not greater than 15 characters"),
    email: z.email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Contain alphanumric and special character"),
    username: z.string().min(3, "Username must contain more than three chracters")
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      username: ""
    }
  })

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/auth/google";
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
    <div style={{ backgroundImage: `url(${bg})` }} className="relative min-h-screen bg-cover bg-center">
      <div className='absolute inset-0 bg-black/30 backdrop-blur-sm'></div>
      <div className='relative z-10 flex items-center justify-center min-h-screen px-4 w-full'>
        <div className="h-4xl flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden p-3">
          <section className="group hidden md:block md:w-1/2 overflow-hidden rounded-md">
            <img src={regImg} alt="register image" className='h-full w-full rounded-md group-hover:scale-125 transition duration-500 ease-in-out cursor-pointer' />
          </section>
          <section className="w-full md:w-1/2 p-3 flex flex-col gap-3">
            <div className="">
              <h1 className="text-3xl font-bold text-gray-800 md:text-4xl mb-1">
                Create an account
              </h1>
              <p className="text-sm text-gray-600">
                Already have an account?
                <Link to="/login" className="ml-1 text-blue-600 hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>

                      <FormControl className='h-10 focus:shadow-md transition duration-500 ease-in-out'>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <div className="min-h-5">
                        <FormMessage className="text-xs" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>

                      <FormControl className='h-10 focus:shadow-md transition duration-500 ease-in-out'>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <div className="min-h-5">
                        <FormMessage className="text-xs" />
                      </div>
                    </FormItem>
                  )}
                />
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
                <Button type='submit' className='w-full h-10 cursor-pointer font-bold'>Register</Button>
              </form>
            </Form>
            <div onClick={handleGoogleLogin} className='h-10 border border-black flex items-center justify-center gap-3 rounded-md cursor-pointer font-semibold'>
              <img src={Google} alt="google logo" className='h-6 w-6' />
              Signin with Google

            </div>
          </section>
        </div>
      </div>
    </div >

  )
}

export default Register