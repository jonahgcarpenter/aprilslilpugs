// COMPONENTS
import ToggleStream from "../components/LiveStream/ToggleStream";
import ToggleWaitlist from "../components/Waitlist/ToggleWaitlist";
import UpdateBreeder from "../components/Breeder/UpdateBreeder";
import UpdateGrumble from "../components/Grumble/UpdateGrumble";
import UpdateWaitlist from "../components/Waitlist/UpdateWaitlist";
import UpdateLitters from "../components/Litter/UpdateLitters";
import AddImages from "../components/Gallery/AddImages";
import UpdateImages from "../components/Gallery/UpdateImages";

// TODO: update images should insta update whenever we add a new image

const Admin = () => {
  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="flex justify-center gap-4">
          <ToggleStream />
          <ToggleWaitlist />
        </div>
        <UpdateWaitlist />
        <UpdateBreeder />
        <UpdateGrumble />
        <UpdateLitters />
        <AddImages />
        <UpdateImages />
      </div>
    </div>
  );
};

export default Admin;
