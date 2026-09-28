interface HeroBannerProps {
  title: string;
  subtitle: string;
}

export function HeroBanner({ title, subtitle }: HeroBannerProps) {
  return (
    <div className="hero-banner -mx-4 rounded-none border-b border-foreground/10 px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:px-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground/70 sm:text-lg">{subtitle}</p>
    </div>
  );
}
