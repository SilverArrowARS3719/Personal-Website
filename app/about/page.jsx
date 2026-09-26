import About from "@/components/About";
import Journey from "@/components/Journey";
import Beyond from "@/components/Beyond";

export const metadata = {
  title: "About VA Ramaswami",
  description:
    "14-year-old builder at the School of Science and Technology, Singapore. Robotics, design engineering, Tamil literature and architecture.",
};

export default function AboutPage() {
  return (
    <>
      <About />
      <Journey />
      <Beyond />
    </>
  );
}
