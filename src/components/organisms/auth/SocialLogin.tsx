'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chrome, Github, Apple } from 'lucide-react';

export function SocialLogin() {
  const socialProviders = [
    {
      name: 'Google',
      icon: Chrome,
      color: 'bg-red-500 hover:bg-red-600',
      provider: 'google'
    },
    {
      name: 'GitHub',
      icon: Github,
      color: 'bg-gray-800 hover:bg-gray-900',
      provider: 'github'
    },
    {
      name: 'Apple',
      icon: Apple,
      color: 'bg-black hover:bg-gray-900',
      provider: 'apple'
    }
  ];

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login functionality
    console.log(`Login with ${provider}`);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <CardHeader className="text-center relative z-10 pb-6">
        <CardTitle className="text-xl font-semibold">
          Continue with Social
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 relative z-10">
        {socialProviders.map((provider, index) => (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={() => handleSocialLogin(provider.provider)}
              className={`w-full h-12 ${provider.color} text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
            >
              <provider.icon className="mr-3 h-5 w-5" />
              Continue with {provider.name}
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}