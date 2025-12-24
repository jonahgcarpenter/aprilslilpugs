import { useBreeder } from "../hooks/usebreeder";
import { useDogs } from "../hooks/usedogs";
import { useLitters } from "../hooks/uselitters";
import { useWaitlist } from "../hooks/usewaitlist";
import UpdateBreeder from "../components/admin/breeder/update-breeder";
import UpdateDogs from "../components/admin/dogs/update-dogs";
import UpdateLitters from "../components/admin/litters/update-litters";
import EditWaitlist from "../components/admin/waitlist/edit-waitlist";
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

  const {
    litters,
    createLitter,
    updateLitter,
    deleteLitter,
    isLoading: isLittersLoading,
  } = useLitters();

  const {
    waitlist,
    updateWaitlist,
    deleteWaitlist,
    isLoading: isWaitlistLoading,
  } = useWaitlist();

  if (
    isBreederLoading ||
    isDogsLoading ||
    isLittersLoading ||
    isWaitlistLoading
  ) {
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

      <section>
        <UpdateDogs
          dogs={dogs}
          onCreate={createDog}
          onUpdate={updateDog}
          onDelete={deleteDog}
        />
      </section>

      <section>
        <UpdateLitters
          litters={litters}
          dogs={dogs}
          onCreate={createLitter}
          onUpdate={updateLitter}
          onDelete={deleteLitter}
        />
      </section>

      <section>
        <EditWaitlist
          waitlist={waitlist}
          onUpdate={updateWaitlist}
          onDelete={deleteWaitlist}
        />
      </section>
    </div>
  );
};

export default Admin;
