import { useBreeder } from "../hooks/usebreeder";
import UpdateBreeder from "../components/admin/update-breeder";
import { FaSpinner } from "react-icons/fa";

const Admin = () => {
  const { breeder, updateBreeder, isLoading } = useBreeder();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return <UpdateBreeder breeder={breeder} onSave={updateBreeder} />;
};

export default Admin;
