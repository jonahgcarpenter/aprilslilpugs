import DisplayLitters from "../components/litters/display-litters";
import { useLitters } from "../hooks/uselitters";

const PastLitters = () => {
  const { pastLitters, isLoading, error } = useLitters();

  return (
    <>
      <title>Past Litters | April's Lil Pugs</title>
      <meta
        name="description"
        content="Browse our archive of past Pug litters. See the beautiful puppies we have raised and their journey."
      />
      <meta property="og:title" content="Past Litters | April's Lil Pugs" />
      <meta property="og:url" content="https://aprilslilpugs.com/pastlitters" />

      <DisplayLitters
        title="Past Litters"
        litters={pastLitters}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
};

export default PastLitters;
