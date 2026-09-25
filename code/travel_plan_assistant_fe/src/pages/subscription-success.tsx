import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { api } from "../axios";

export function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifySubscription = async () => {
      try {
        const { data } = await api.post("/api/subscriptions/verify", { session_id: sessionId });
        if (data.success) {
          setStatus("success");
          setTimeout(() => {
            navigate("/plan");
          }, 3000);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Failed to verify subscription:", err);
        setStatus("error");
      }
    };

    verifySubscription();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md text-center">
        {status === "loading" && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Verifying payment...</h2>
            <p className="mt-2 text-sm text-gray-600">Please wait while we confirm your subscription.</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Subscription Successful!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for subscribing. You now have unlimited access to create travel plans.
            </p>
            <p className="mt-4 text-sm text-gray-500">Redirecting you to the planner...</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-600">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
            <button
              onClick={() => navigate("/subscription")}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
