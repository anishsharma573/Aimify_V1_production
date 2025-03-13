// hooks/useSchool.js
import { useState, useEffect } from "react";
import axiosInstance from "../services/api";
import { toast } from "react-toastify";

const useSchool = () => {
  const [school, setSchool] = useState(null);
  const [loadingSchool, setLoadingSchool] = useState(false);

  // Extract the subdomain from the current window hostname.
  const getSubdomain = () => {
    const hostname = window.location.hostname; // e.g., "nps.localhost"
    const parts = hostname.split(".");
    return parts.length > 1 ? parts[0] : "";
  };

  useEffect(() => {
    const fetchSchool = async () => {
      setLoadingSchool(true);
      const subdomain = getSubdomain();
      try {
        const response = await axiosInstance.post(
          "/school/getSchool",
          { subdomain },
          {
            withCredentials: true,
            headers: { Authorization: "" }, // ensure no token is sent for this call
          }
        );
        setSchool(response.data.data);
      } catch (error) {
        console.error("Error fetching school details:", error.response?.data);
        toast.error(
          error.response?.data?.message || "Error fetching school details"
        );
      } finally {
        setLoadingSchool(false);
      }
    };

    fetchSchool();
  }, []);

  return { school, loadingSchool };
};

export default useSchool;
