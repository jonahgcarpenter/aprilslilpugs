import Grumble from "../components/dogs/grumble";
import { useDogs } from "../hooks/usedogs";

const OurAdults = () => {
  const { dogs, isLoading, error } = useDogs();
  const livingDogs = dogs.filter((dog) => !dog.deathAt);

  return (
    <>
      <title>Our Adults | April's Lil Pugs</title>
      <meta
        name="description"
        content="Meet the parents! View our healthy, Pug studs and females. See photos and learn about their personalities."
      />
      <meta property="og:title" content="Our Adult Pugs | April's Lil Pugs" />
      <meta property="og:url" content="https://aprilslilpugs.com/ouradults" />

      <Grumble grumbles={livingDogs} isLoading={isLoading} error={error} />
    </>
  );
};

export default OurAdults;
