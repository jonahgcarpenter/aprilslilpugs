import { useSettings } from "../../hooks/useSettings";
import LoadingAnimation from "../Misc/LoadingAnimation";

const ToggleStream = () => {
  const { settings, toggleLive, toggleLiveLoading } = useSettings();

  const liveEnabled = settings?.liveEnabled;
  const isDisabled = toggleLiveLoading || liveEnabled === null;

  return (
    <button
      onClick={() => toggleLive()}
      disabled={isDisabled}
      className={`
        w-full sm:w-auto
        bg-gradient-to-r from-blue-600 to-blue-400
        hover:from-blue-700 hover:to-blue-500
        text-white
        px-4 sm:px-6
        py-2.5
        text-sm
        rounded-full
        font-semibold
        shadow-md
        hover:shadow-lg
        transform
        hover:scale-105
        transition-transform
        duration-200
        ${isDisabled ? "opacity-50 cursor-not-allowed hover:scale-100" : ""}
      `}
    >
      {toggleLiveLoading ? (
        <LoadingAnimation containerClassName="h-6" />
      ) : liveEnabled === null ? (
        "Loading..."
      ) : liveEnabled ? (
        "Disable Live Page"
      ) : (
        "Enable Live Page"
      )}
    </button>
  );
};

export default ToggleStream;
