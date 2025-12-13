import AboutMe from "../components/breeder/about-me";
import { useBreeder } from "../hooks/usebreeder";

const Home = () => {
  const { breeder, isLoading, error } = useBreeder();

  return <AboutMe breeder={breeder} isLoading={isLoading} error={error} />;
};

export default Home;
