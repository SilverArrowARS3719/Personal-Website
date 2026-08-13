import Highlights from "@/components/Highlights";
import CaseStudies from "@/components/CaseStudies";
import Recognition from "@/components/Recognition";

export const metadata = {
  title: "Achievements, VA Ramaswami",
  description:
    "National awards, competition case studies, Tamil literature and leadership: everything VA Ramaswami has won.",
};

export default function AchievementsPage() {
  return (
    <>
      <Highlights />
      <CaseStudies />
      <Recognition />
    </>
  );
}
