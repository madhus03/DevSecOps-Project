import Box from "@mui/material/Box";
import { Outlet, useLocation, useNavigation } from "react-router-dom";

import DetailModal from "src/components/DetailModal";
import { Footer, MainHeader } from "src/components/layouts";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import VideoPortalContainer from "src/components/VideoPortalContainer";
import { MAIN_PATH } from "src/constant";
import DetailModalProvider from "src/providers/DetailModalProvider";
import PortalProvider from "src/providers/PortalProvider";

export default function MainLayout() {
  const location = useLocation();
  const navigation = useNavigation();
  // console.log("Nav Stat: ", navigation.state);
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <MainHeader />
      {navigation.state !== "idle" && <MainLoadingScreen />}
      <DetailModalProvider>
        <DetailModal />
        <PortalProvider>
          {/* <MainLoadingScreen /> */}
          <Outlet />
          <VideoPortalContainer />
        </PortalProvider>
      </DetailModalProvider>
      {location.pathname !== `/${MAIN_PATH.watch}` && <Footer />}
    </Box>
  );
}