import GrumbleInfo from "../components/Grumble/GrumbleInfo";

const grumbles = [
  {
    id: 1,
    name: "Winston",
    gender: "Male",
    description:
      "Winston is a playful and loving pug who enjoys cuddling and playing with his toys. He is very friendly and gets along well with other pets.",
    birthDate: "2019-06-16",
    profilePicture: "/logo.PNG",
  },
  {
    id: 2,
    name: "Winston",
    gender: "Male",
    description:
      "Winston is a playful and loving pug who enjoys cuddling and playing with his toys. He is very friendly and gets along well with other pets.",
    birthDate: "2019-06-16",
    profilePicture: "/logo.PNG",
  },
  {
    id: 3,
    name: "Winston",
    gender: "Male",
    description:
      "Winston is a playful and loving pug who enjoys cuddling and playing with his toys. He is very friendly and gets along well with other pets.",
    birthDate: "2019-06-16",
    profilePicture: "/logo.PNG",
  },
  {
    id: 4,
    name: "Winston",
    gender: "Male",
    description:
      "Winston is a playful and loving pug who enjoys cuddling and playing with his toys. He is very friendly and gets along well with other pets.",
    birthDate: "2019-06-16",
    profilePicture: "/logo.PNG",
  },
];

const OurAdults = () => {
  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <GrumbleInfo grumbles={grumbles} />
      </div>
    </div>
  );
};

export default OurAdults;
