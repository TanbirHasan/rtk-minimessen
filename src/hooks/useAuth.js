import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function useAuth() {


  const auth = useSelector((state) => state.auth);
  if (auth?.accessToken !== undefined && auth?.user !== undefined) {
    return true;
  } else {
    return false;
  }
}
