import GrumbleInfo from "../components/Grumble/GrumbleInfo";
import grumble from "../tempdata/grumble.js";

const OurAdults = () => {
  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <GrumbleInfo grumble={grumble} />
      </div>
    </div>
  );
};

export default OurAdults;
