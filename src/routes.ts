import { createBrowserRouter } from "react-router";
import { Root } from "./pages/root";
import { Home } from "./pages/home";
import { Dashboard } from "./pages/dashboard";
import { Destinations } from "./pages/destinations";
import { Itinerary } from "./pages/itinerary";
import { Budget } from "./pages/budget";
import { MyProfile } from "./pages/my-profile";
import { MyTrips } from "./pages/my-trips";
import { Wishlist } from "./pages/wishlist";
import { DestinationDetails } from "./pages/destination-details";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // Public routes
      { index: true, Component: Dashboard },
      { path: "plan", Component: Home },
      { path: "destinations", Component: Destinations },
      { path: "destinations/:id", Component: DestinationDetails },

      // Protected routes
      {
        Component: ProtectedRoute,
        children: [
          { path: "itinerary", Component: Itinerary },
          { path: "budget", Component: Budget },
          { path: "profile", Component: MyProfile },
          { path: "my-trips", Component: MyTrips },
          { path: "wishlist", Component: Wishlist },
        ],
      },
    ],
  },
]);
