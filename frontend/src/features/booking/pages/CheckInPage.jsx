import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Clock,
  Users,
} from "lucide-react";
import axiosClient from "../../../api/axiosClient";

const CheckInPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [booking, setBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkedInAt] = useState(new Date());

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("invalid");
      return;
    }

    axiosClient
      .post(`/api/bookings/checkin?token=${token}`)
      .then((res) => {
        setBooking(res.data.data || res.data);
        setStatus("success");
      })
      .catch((err) => {
        const code = err.response?.status;
        if (code === 400 || code === 409) {
          setErrorMessage(
            err.response?.data?.message || "Check-in could not be completed."
          );
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">

        {/* LOADING STATE */}
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Verifying your check-in...</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <>
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Checked In!</h1>
            <p className="text-slate-500 text-sm mb-6">
              Your attendance has been recorded.
            </p>

            {booking && (
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Resource</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.resourceName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.resourceLocation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(booking.startTime).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      →{" "}
                      {new Date(booking.endTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {booking.attendees && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Attendees</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {booking.attendees} people
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="text-emerald-700 text-sm font-medium">
                ✅ Checked in at{" "}
                {checkedInAt.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <>
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Check-In Failed
            </h1>
            <p className="text-slate-500 text-sm mb-4">{errorMessage}</p>
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm">
                If you believe this is an error, please contact the admin or
                show your approval email at the reception.
              </p>
            </div>
          </>
        )}

        {/* INVALID TOKEN STATE */}
        {status === "invalid" && (
          <>
            <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Invalid Link
            </h1>
            <p className="text-slate-500 text-sm">
              This check-in link is invalid or has expired. Please use the link
              from your approval email.
            </p>
          </>
        )}

        <p className="text-xs text-slate-400 mt-6">
          Smart Campus Operations Hub — SLIIT
        </p>
      </div>
    </div>
  );
};

export default CheckInPage;
