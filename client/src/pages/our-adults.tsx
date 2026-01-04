import Grumble from "../components/dogs/grumble";
import { useDogs } from "../hooks/usedogs";

const OurAdults = () => {
  const { dogs, isLoading, error } = useDogs();

  return (
    <>
      <title>Our Adults | April's Lil Pugs</title>
      <meta
        name="description"
        content="Meet the parents! View our healthy, Pug studs and females. See photos and learn about their personalities."
      />
      <meta property="og:title" content="Our Adult Pugs | April's Lil Pugs" />
      <meta property="og:url" content="https://aprilslilpugs.com/ouradults" />

      <Grumble grumbles={dogs} isLoading={isLoading} error={error} />
    </>
  );
};

export default OurAdults;
