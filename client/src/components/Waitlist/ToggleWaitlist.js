import { useSettings } from "../../hooks/useSettings";
import LoadingAnimation from "../Misc/LoadingAnimation";

const ToggleWaitlist = () => {
  const { settings, toggleWaitlist, toggleWaitlistLoading } = useSettings();

  const waitlistEnabled = settings?.waitlistEnabled;
  const isDisabled = toggleWaitlistLoading || waitlistEnabled === null;

  return (
    <button
      onClick={() => toggleWaitlist()}
      disabled={isDisabled}
      className={`
        w-full sm:w-auto
        ${waitlistEnabled ? "bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500" : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"}
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
      {toggleWaitlistLoading ? (
        <LoadingAnimation containerClassName="h-6" />
      ) : waitlistEnabled === null ? (
        "Loading..."
      ) : waitlistEnabled ? (
        "Disable Waitlist"
      ) : (
        "Enable Waitlist"
      )}
    </button>
  );
};

export default ToggleWaitlist;
