// src/app/History/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/apiConfig";

interface HistoryEntry {
  id: number;
  user_id: string;
  patient_info: {
    first_name: string;
    last_name: string;
    [key: string]: unknown;
  };
  score: number;
  submitted_diagnosis: string;
  feedback: string;
  created_at: string;
}

interface CaseHistory {
  patientName: string;
  diagnosis: string;
  score: string;
  date: string;
  feedback: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<CaseHistory[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/fetchHistory`, {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: HistoryEntry[] = await res.json();
        const transformed = data.map((e) => ({
          patientName: `${e.patient_info.first_name} ${e.patient_info.last_name}`,
          diagnosis: e.submitted_diagnosis,
          score: `${e.score}/50`,
          date: new Date(e.created_at).toLocaleDateString(),
          feedback: e.feedback,
        }));
        setHistory(transformed);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        activePage="History" 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />
      <div className="flex-1 flex flex-col">
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        <main className="flex-1 p-12">
          <h1 className="text-5xl font-bold text-mcmaster-maroon mb-4 stic">
            History
          </h1>

          <div className="bg-white rounded-lg shadow-md overflow-scroll max-h-200">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-mcmaster-maroon text-white">
                <tr>
                  <th className="py-4 px-8 text-left font-semibold">Patient</th>
                  <th className="py-4 px-8 text-left font-semibold">
                    Diagnosis
                  </th>
                  <th className="py-4 px-8 text-left font-semibold">Score</th>
                  <th className="py-4 px-8 text-left font-semibold">Date</th>
                  <th className="py-4 px-8"></th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-8 text-center">
                      Loading…
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-8 text-center">
                      No history found
                    </td>
                  </tr>
                ) : (
                  history.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-8">{item.patientName}</td>
                      <td className="py-4 px-8">{item.diagnosis}</td>
                      <td className="py-4 px-8">{item.score}</td>
                      <td className="py-4 px-8">{item.date}</td>
                      <td className="py-4 px-8 text-right">
                        <button
                          onClick={() => {
                            setSelectedFeedback(item.feedback);
                            setIsModalOpen(true);
                          }}
                          aria-label="View feedback"
                        >
                          <ChevronDown className="w-5 h-5 text-mcmaster-maroon" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* INLINE MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
                <div className="bg-mcmaster-maroon px-6 py-4">
                  <h3 className="text-white text-xl font-semibold">
                    Case Feedback
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-800 mb-4">{selectedFeedback}</p>
                  <Button
                    className="bg-mcmaster-maroon hover:bg-mcmaster-maroon/90 text-white"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
