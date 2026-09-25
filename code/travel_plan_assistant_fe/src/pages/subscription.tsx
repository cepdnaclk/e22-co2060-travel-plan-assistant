import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../axios";

export function Subscription() {
  useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ isSubscribed: boolean; planCount: number } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/api/subscriptions/status");
      if (data.success) {
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription status");
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/api/subscriptions/create-checkout-session");
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Upgrade Your Travel Planning
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          You have used {status?.planCount ?? 0} out of 3 free trips.
        </p>
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-xl overflow-hidden max-w-lg mx-auto">
        <div className="px-6 py-8 sm:p-10 sm:pb-6">
          <div className="flex justify-center">
            <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-600">
              Premium Plan
            </span>
          </div>
          <div className="mt-4 flex justify-center text-6xl font-extrabold text-gray-900">
            <span className="ml-1 text-xl font-medium text-gray-500">$</span>
            9.99
            <span className="ml-1 text-xl font-medium text-gray-500">/one-time</span>
          </div>
          <p className="mt-5 text-lg text-gray-500 text-center">
            Unlock unlimited travel plans and premium features.
          </p>
        </div>
        <div className="px-6 pt-6 pb-8 sm:p-10 sm:pt-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">Unlimited Trip Plans</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">Priority Support</p>
            </li>
          </ul>

          <div className="mt-8">
            {status?.isSubscribed ? (
              <div className="rounded-md shadow">
                <button
                  disabled
                  className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 cursor-not-allowed"
                >
                  You are already subscribed!
                </button>
              </div>
            ) : (
              <div className="rounded-md shadow">
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Subscribe Now"}
                </button>
              </div>
            )}
          </div>
          {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
