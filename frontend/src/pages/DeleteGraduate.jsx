import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const authURL = import.meta.env.VITE_ADMIN_ROUTE
const national_ID_URL = import.meta.env.VITE_NATIONAL_ID_ROUTE;
const DeleteGraduate = () => {
  const { certificateID } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const deleteGraduate = async () => {
      if (window.confirm("Are you sure you want to delete this graduate?")) {
        await axios.delete(`${authURL}/certificate/${certificateID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate('/admin/view-graduates');
      } else {
        navigate('/admin/view-graduates');
      }
    };
    deleteGraduate();
  }, [certificateID]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <h2 className="text-2xl">Deleting Graduate...</h2>
    </div>
  );
};

export default DeleteGraduate;
