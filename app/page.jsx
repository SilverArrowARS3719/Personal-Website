import HeroSlide from "@/components/home/HeroSlide";
import F1Slide from "@/components/home/F1Slide";
import SmashSlide from "@/components/home/SmashSlide";

// Three pinned scroll slides; the site-wide Footer closes the page as the fourth.
export default function Home() {
  return (
    <>
      <HeroSlide />
      <F1Slide />
      <SmashSlide />
    </>
  );
}
