import { getStrings } from "@/lib/content";

const strings = getStrings("au");

export default function AuHome() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">{strings.hero.title}</h1>
      <p className="mt-3 max-w-xl text-black/70 dark:text-white/70">{strings.hero.subtitle}</p>
    </>
  );
}
