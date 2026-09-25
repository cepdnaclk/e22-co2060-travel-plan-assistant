import { createBrowserRouter } from "react-router";
import { Root } from "./pages/root";
import { Home } from "./pages/home";
import { Dashboard } from "./pages/dashboard";
import { Destinations } from "./pages/destinations";
import { Itinerary } from "./pages/itinerary";
import { MyProfile } from "./pages/my-profile";
import { MyTrips } from "./pages/my-trips";
import { Wishlist } from "./pages/wishlist";
import { DestinationDetails } from "./pages/destination-details";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AdminDashboard } from "./pages/admin-dashboard";
import { Subscription } from "./pages/subscription";
import { SubscriptionSuccess } from "./pages/subscription-success";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // Public routes
      { index: true, Component: Dashboard },
      { path: "destinations", Component: Destinations },
      { path: "destinations/:id", Component: DestinationDetails },

      // Protected routes
      {
        Component: ProtectedRoute,
        children: [
          { path: "plan", Component: Home },
          { path: "itinerary", Component: Itinerary },
          // { path: "budget", Component: Budget }, // Disabled as per user request to integrate into itinerary
          { path: "profile", Component: MyProfile },
          { path: "my-trips", Component: MyTrips },
          { path: "wishlist", Component: Wishlist },
          { path: "subscription", Component: Subscription },
          { path: "subscription/success", Component: SubscriptionSuccess },
        ],
      },

      // Admin routes
      {
        Component: AdminRoute,
        children: [
          { path: "admin", Component: AdminDashboard },
        ],
      },
    ],
  },
]);
