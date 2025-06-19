import { auth } from "@/auth";
import NavbarAdminClient from "./NavbarAdminClient";

const NavbarAdmin = async () => {
  const session = await auth();

  return <NavbarAdminClient session={session} />;
};

export default NavbarAdmin;
