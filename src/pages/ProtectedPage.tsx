import { Navigate } from "react-router-dom";

const ProtectedPage = () => {
  return <Navigate to="/inventory" replace />;
};

export default ProtectedPage;
