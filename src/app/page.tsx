"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  fetchSignInMethodsForEmail
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { ArrowLeft, Lock, XCircle, Pencil, Eye, EyeOff } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
});

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.886,44,30.34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'loginPassword' | 'registerPassword'>('email');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onContinue = async () => {
    const isValid = await form.trigger('email');
    if (!isValid) return;

    const emailValue = form.getValues('email');
    setIsLoading(true);
    try {
        const methods = await fetchSignInMethodsForEmail(auth, emailValue);
        setEmail(emailValue);
        if (methods.length > 0) {
            setStep('loginPassword');
        } else {
            setStep('registerPassword');
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const onLogin = async (values: z.infer<typeof formSchema>) => {
    if (!values.password) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, values.password);
      toast({ title: 'Success', description: "You've successfully signed in." });
      router.push('/home');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  const onRegister = async (values: z.infer<typeof formSchema>) => {
    if (!values.password) return;
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, values.password);
      toast({ title: 'Account Created', description: "You've successfully created your account." });
      router.push('/home');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    if (step === 'loginPassword') {
      onLogin(values);
    } else if (step === 'registerPassword') {
      onRegister(values);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        toast({ title: "Success", description: "You've successfully signed in with Google." });
        router.push("/home");
    } catch (error: any) {
        toast({ variant: "destructive", title: "Google Sign-In Failed", description: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  }
  
  const editEmail = () => {
    setStep('email');
    setShowPassword(false);
    form.reset({ email: email, password: '' });
  }

  const getTitle = () => {
    switch (step) {
      case 'email':
        return 'Login / Register';
      case 'loginPassword':
        return 'Enter your password';
      case 'registerPassword':
        return 'Create Your Account';
    }
  };

  const getSubtitle = () => {
    if (step === 'email') {
      return (
        <div className="flex items-start justify-center gap-1.5 text-gray-600 mb-8 text-sm text-center px-4">
            <Lock size={16} className="flex-shrink-0 mt-0.5"/>
            <span>We use industry-standard encryption to keep your data safe.</span>
        </div>
      );
    }
    return <p className="text-gray-600 text-center mb-8">Simple and secure.</p>
  }
  
  const getButtonText = () => {
    switch (step) {
      case 'email': return 'Continue';
      case 'loginPassword': return 'Login';
      case 'registerPassword': return 'Register';
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <PublicHeader />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-sm">
            <button onClick={step === 'email' ? goBack : editEmail} className="flex items-center text-sm font-medium text-gray-600 hover:text-black mb-4">
                <ArrowLeft size={16} />
            </button>
          
            <h1 className="text-3xl font-bold text-center mb-4">{getTitle()}</h1>
            {getSubtitle()}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email/Phone Number</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        placeholder="Mobile Number or Email" 
                                        {...field} 
                                        className="pr-10"
                                        readOnly={step !== 'email'}
                                    />
                                    {step === 'email' ? (
                                        field.value && (
                                            <button
                                                type="button"
                                                onClick={() => form.setValue('email', '')}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                aria-label="Clear email"
                                            >
                                                <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={editEmail}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            aria-label="Edit email"
                                        >
                                            <Pencil className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    
                    {(step === 'loginPassword' || step === 'registerPassword') && (
                         <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input 
                                            type={showPassword ? "text" : "password"}
                                            placeholder={step === 'loginPassword' ? "Password" : "Create Password"} 
                                            {...field} autoFocus 
                                        />
                                         <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                         )}/>
                    )}
                    
                    <Button 
                        type={step === 'email' ? 'button' : 'submit'} 
                        onClick={step === 'email' ? onContinue : undefined}
                        className="w-full !mt-6" 
                        size="lg" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : getButtonText()}
                    </Button>
                </form>
            </Form>
            
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">Or</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn} disabled={isLoading}>
                <GoogleIcon />
                {step === 'registerPassword' ? 'Register with Google' : 'Continue with Google'}
            </Button>

            <p className="text-center text-xs text-gray-500 mt-8">
                By {step === 'registerPassword' ? 'Register' : 'continuing'}, you agree to our{' '}
                <Link href="#" className="underline">Privacy & Cookie Policy</Link> and{' '}
                <Link href="#" className="underline">Terms & Conditions</Link>.
            </p>
        </div>
      </main>
    </div>
  );
}
