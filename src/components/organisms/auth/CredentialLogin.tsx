'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, getSession } from 'next-auth/react';
import { useAuthStore } from '@/stores/authStores';
import { loginSchema, LoginFormData } from '@/lib/zodValidation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Loader2, 
  Shield,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link'; 

export function CredentialsLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const { login: loginToStore, setLoading } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      try {
        setLoading(true);
        
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          if (result.error === "CredentialsSignin") {
             toast.error('Invalid credentials', {
                description: 'Please check your email and password and try again.',
             });
          } else {
            toast.error('Login failed', {
              description: result.error || 'An unknown error occurred.',
            });
          }
          return;
        }

        if (result?.ok && !result.error) {
          const session = await getSession(); 
          
          if (session?.user) {
            loginToStore({
              id: session.user.id,
              email: session.user.email!, 
              name: session.user.name || undefined,
              role: session.user.role, 
              avatar: session.user.image || undefined,
              isVerified: session.user.isEmailVerified,
            });
          }
          
          toast.success('Welcome back!', {
            description: 'You have successfully signed in.',
          });

          router.push(callbackUrl);
          router.refresh();
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Something went wrong', {
          description: 'Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-2xl">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      {/* Floating decorative element */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="opacity-20"
        >
          <TrendingUp className="h-4 w-4 text-primary" />
        </motion.div>
      </div>

      <CardHeader className="space-y-4 text-center relative z-10 pb-8">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 200 
          }}
          className="mx-auto"
        >
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          </div>
        </motion.div>

        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-12 border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                {...form.register('email')}
              />
            </div>
            {form.formState.errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 mt-1"
              >
                {form.formState.errors.email.message}
              </motion.p>
            )}
          </motion.div>

          {/* Password field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10 h-12 border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 mt-1"
              >
                {form.formState.errors.password.message}
              </motion.p>
            )}
          </motion.div>

          {/* Submit button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Additional options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Need help?
              </span>
            </div>
          </div>

         <div className="flex items-center justify-between text-sm">
            <Link
              href="/auth/reset-password" 
              className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
            >
              Forgot password?
            </Link>
            <Link
              href="/auth/register" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Create account
            </Link>
          </div>
        </motion.div>
      </CardContent>

      {/* Bottom gradient effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </Card>
  );
}