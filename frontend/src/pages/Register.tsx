import bg from '@/assets/bg.jpg';
import chatappImage from '@/assets/chatapp-image.jpg'
import { Button } from '@/components/ui/button';
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

const Register = () => {
  const navigate = useNavigate();

  const formSchema = z.object({
    name: z.string().min(3, "Name should be more than three characters").max(15, "Name should not greater than 15 characters"),
    email: z.email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Password should contain uppercase,lowercase, number, special character")
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  })

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
      <div className='relative z-10 flex items-center justify-center min-h-screen px-4'>
        <div className='flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-black/40 md:flex-row'>
          <div style={{ backgroundImage: `url(${chatappImage})` }} className='relative hidden md:flex bg-center bg-cover w-1/2'>
            <Button variant="link" className="absolute top-4 left-4 text-white">Back to website</Button>
          </div>
          <div className='w-full p-6 md:w-1/2'>
            <h2 className='text-2xl text-center text-white'>Create an account</h2>
            <p className="mt-1 text-center text-xs text-white">
              Already have an account?{" "}
              <Link
                to="/login"
                className="underline text-blue-400 hover:text-blue-300"
              >
                Login
              </Link>
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>

                      <FormControl>
                        <Input placeholder="Enter name" className='text-white' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <Button type="submit" className='w-full bg-white hover:bg-white/90 text-black cursor-pointer'>Register</Button>
              </form>
            </Form>
            <div className='mt-6 space-y-4'>

              <div className='flex items-center gap-3'>
                <div className='h-px flex-1 bg-white/30'></div>
                <p className='text-white text-xs'>Or register with</p>
                <div className='h-px flex-1 bg-white/30'></div>
              </div>
              <div className='flex gap-3'>
                <Button className='bg-white text-black w-1/2 cursor-pointer' variant="secondary">Google</Button>
                <Button className='bg-white text-black w-1/2 cursor-pointer' variant="secondary">Facebook</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Register