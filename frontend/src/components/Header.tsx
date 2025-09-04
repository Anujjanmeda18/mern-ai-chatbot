import { AppBar } from "@mui/material";
import { Toolbar } from "@mui/material";
import Logo from "./shared/logo";
import { useAuth } from "../Context/AuthContext";
import NavigationLink from "./shared/NavigationLink";

const Header = () => {
  const auth = useAuth();
  return (
    <>
      <AppBar
        sx={{ bgcolor: "transparent", position: "static", boxShadow: "none" }}
      >
        <Toolbar sx={{ display: "flex" }}>
          <Logo />
          <div>
            {auth?.isLoggedIn ? (
              <>
                <NavigationLink
                  bg="#00fffc"
                  to="/chat"
                  text="Go to Chat"
                  textcolor="black"
                />
                <NavigationLink
                  bg="#51538f"
                  textcolor="white"
                  to="/"
                  text="logout"
                  onClick={auth.logout}
                />
              </>
            ) : (
              <>
                <NavigationLink
                  bg="#00fffc"
                  to="/login"
                  text="Login"
                  textcolor="black"
                />
                <NavigationLink
                  bg="#51538f"
                  textcolor="white"
                  to="/signup"
                  text="Signup"
                />
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
