import { Cog } from 'lucide-react'; 
// import { Button } from '@/components/ui/button'; // For CTA button
// import Link from 'next/link';

export function HeroSection() {
  return (
    <section 
      className="relative flex min-h-[60vh] items-center justify-center bg-primary text-primary-foreground py-16 md:py-24"
      // For image background (uncomment and adjust):
      // style={{ backgroundImage: `url('/placeholder-hero-image.jpg')` }}
    >
      {/* Optional: Dim overlay if using background image */}
      {/* <div className="absolute inset-0 bg-black/50 z-0"></div> */}
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mb-6 flex justify-center">
          <Cog className="h-20 w-20 md:h-28 md:w-28 text-tertiary-400 dark:text-tertiary-300" />
        </div>
        <h1 className="mb-4 font-heading text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          Work Vault
        </h1>
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-lg font-body md:text-xl text-primary-foreground/90">
            A catchy subheading to entice the viewer
          </p>
          <p className="text-lg font-body md:text-xl text-primary-foreground/90">
            to view more of the website.
          </p>
        </div>
        {/* Optional Call to Action Buttons */}
        {/*
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/jobs">
            <Button size="lg" className="bg-tertiary-500 hover:bg-tertiary-600 text-tertiary-foreground dark:text-secondary-900 w-full sm:w-auto">
              Find a Job
            </Button>
          </Link>
          <Link href="/companies/post-job">
            <Button size="lg" variant="outline" className="border-primary-foreground/50 hover:bg-primary-foreground/10 text-primary-foreground w-full sm:w-auto">
              Post a Job
            </Button>
          </Link>
        </div>
        */}
      </div>
    </section>
  );
}