import { useBreeder } from "../hooks/usebreeder";
import { useDogs } from "../hooks/usedogs";
import { useLitters } from "../hooks/uselitters";
import { useWaitlist } from "../hooks/usewaitlist";
import { useSettings } from "../hooks/usesettings";
import UpdateBreeder from "../components/admin/breeder/update-breeder";
import UpdateDogs from "../components/admin/dogs/update-dogs";
import UpdateLitters from "../components/admin/litters/update-litters";
import EditWaitlist from "../components/admin/waitlist/edit-waitlist";
import {
  FaSpinner,
  FaVideo,
  FaClipboardList,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

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

  const {
    settings,
    toggleWaitlist,
    toggleStream,
    isLoading: isSettingsLoading,
  } = useSettings();

  if (
    isBreederLoading ||
    isDogsLoading ||
    isLittersLoading ||
    isWaitlistLoading ||
    isSettingsLoading
  ) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Waitlist Toggle */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${settings?.waitlist_enabled ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-500"}`}
              >
                <FaClipboardList className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">
                  Public Waitlist
                </h3>
                <p className="text-xs text-slate-500">
                  Allow new signups via the nursery page
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleWaitlist(!settings?.waitlist_enabled)}
              className={`cursor-pointer text-3xl transition-colors ${
                settings?.waitlist_enabled
                  ? "text-green-500 hover:text-green-400"
                  : "text-slate-600 hover:text-slate-500"
              }`}
            >
              {settings?.waitlist_enabled ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>

          {/* Stream Toggle */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex items-center justify-between group hover:border-red-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${settings?.stream_enabled ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-500"}`}
              >
                <FaVideo className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Live Stream</h3>
                <p className="text-xs text-slate-500">
                  Enable the live camera feed on the home page
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleStream(!settings?.stream_enabled)}
              className={`cursor-pointer text-3xl transition-colors ${
                settings?.stream_enabled
                  ? "text-red-500 hover:text-red-400"
                  : "text-slate-600 hover:text-slate-500"
              }`}
            >
              {settings?.stream_enabled ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>
        </div>
      </section>

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
