import BreederInfo from "../components/Breeder/BreederInfo";
import breeder from "../tempdata/breeder.js";

const Home = () => {
  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <BreederInfo breeder={breeder} />
      </div>
    </div>
  );
};

export default Home;
