import { auth } from "@/auth";
import NavbarDosenClient from "./NavbarDosenClient";

const NavbarAdmin = async () => {
  const session = await auth();

  return <NavbarDosenClient session={session} />;
};

export default NavbarAdmin;
