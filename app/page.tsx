// app/page.tsx
import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestions";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="w-full md:w-2/3">
            <h2 className="mb-6 text-2xl font-bold">Latest Questions</h2>
            <LatestQuestions />
          </div>
          <div className="w-full md:w-1/3">
            <h2 className="mb-6 text-2xl font-bold">Top Contributors</h2>
            <TopContributers />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}