import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Send notification API function
const sendNotification = async () => {
  const response = await axios.post("/api/notify", {
    message: "Puppy Cam is down!",
    title: "Oswald",
    data: {
      push: {
        sound: "DeviceShutdown.caf",
        badge: 1,
      },
    },
  });
  return response.data;
};

// Notification hook
export const useNotify = () => {
  const notifyMutation = useMutation({
    mutationFn: sendNotification,
  });

  return {
    sendNotification: notifyMutation.mutate,
    isNotifying: notifyMutation.isLoading,
    notifyError: notifyMutation.error,
  };
};
