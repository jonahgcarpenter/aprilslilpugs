import AboutMe from "../components/breeder/about-me";
import { useBreeder } from "../hooks/usebreeder";

const Home = () => {
  const { breeder, isLoading, error } = useBreeder();

  return (
    <>
      <title>April's Lil Pugs | Pug Breeder in Tupelo, MS</title>
      <meta
        name="description"
        content="Passionate Pug breeder in Tupelo, Mississippi raising healthy, happy pug puppies. Explore our available puppies, adults, and past litters."
      />
      <meta property="og:title" content="Home | April's Lil Pugs" />
      <meta property="og:url" content="https://aprilslilpugs.com/" />

      <AboutMe breeder={breeder} isLoading={isLoading} error={error} />
    </>
  );
};

export default Home;
