import AboutMe from "../components/breeder/about-me";
import { useBreeder } from "../hooks/usebreeder";

const Home = () => {
  const { breeder, isLoading, error } = useBreeder();

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <AboutMe breeder={breeder} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default Home;
