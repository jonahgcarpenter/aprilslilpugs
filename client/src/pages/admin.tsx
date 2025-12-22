import { useBreeder } from "../hooks/usebreeder";
import { useDogs } from "../hooks/usedogs";
import UpdateBreeder from "../components/admin/update-breeder";
import UpdateDogs from "../components/admin/update-dogs";
import { FaSpinner } from "react-icons/fa";

const Admin = () => {
  const { breeder, updateBreeder, isLoading: isBreederLoading } = useBreeder();

  const {
    dogs,
    createDog,
    updateDog,
    deleteDog,
    isLoading: isDogsLoading,
  } = useDogs();

  if (isBreederLoading || isDogsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <UpdateBreeder breeder={breeder} onSave={updateBreeder} />
      </section>

      <div className="border-t border-white/10" />

      <section>
        <UpdateDogs
          dogs={dogs}
          onCreate={createDog}
          onUpdate={updateDog}
          onDelete={deleteDog}
        />
      </section>
    </div>
  );
};

export default Admin;
