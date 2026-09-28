interface HeroBannerProps {
  title: string;
  subtitle: string;
}

export function HeroBanner({ title, subtitle }: HeroBannerProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground/75 sm:text-lg">{subtitle}</p>
    </div>
  );
}
