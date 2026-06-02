"use client";
import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { getApiUrl } from "../lib/getApiUrl";

type Banner = {
  _id: string;
  desktopImage: string;
  mobileImage: string;
  isActive: boolean;
  desktopFit: string;
  desktopPosition: string;
  mobileFit: string;
  mobilePosition: string;
};

type FieldProps = { label: string; children: ReactNode };

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [desktopFit, setDesktopFit] = useState("cover");
  const [desktopPosition, setDesktopPosition] = useState("center");
  const [mobileFit, setMobileFit] = useState("cover");
  const [mobilePosition, setMobilePosition] = useState("center");
  const [loading, setLoading] = useState(false);
  const api = getApiUrl();

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${api}/banner`);
      const data = await res.json();
      if (data.banners) setBanners(data.banners);
    } catch (err) {
      console.error(err);
    }
  }, [api]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    if (type === "desktop") {
      setDesktopImage(b64);
    } else {
      setMobileImage(b64);
    }
  };

  const addBanner = async () => {
    if (!desktopImage || !mobileImage) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${api}/banner/add`, {
        method: "POST",
        body: JSON.stringify({
          desktopImage,
          mobileImage,
          desktopFit,
          desktopPosition,
          mobileFit,
          mobilePosition,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(prev => [...prev, data.banner]);
        setDesktopImage("");
        setMobileImage("");
        setShowModal(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add banner");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const authToken = localStorage.getItem("token") || "";
    if (!authToken) { alert('Not logged in — please sign in to perform this action.'); return; }
    const res = await fetchWithAuth(`${api}/banner/delete/${id}`, { method: "DELETE" });
    if (res.ok) setBanners(prev => prev.filter(b => b._id !== id));
  };

  return (
    <div>
      <style>{`
        .card { background: #13131a; border: 1px solid #1e1e2e; border-radius: 12px; }
        .btn-primary { background: var(--brand); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-primary:hover { background: var(--brand-dark); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #555570; border: 1px solid #1e1e2e; border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; }
        .btn-ghost:hover { color: #ef4444; border-color: #ef444440; }
        .overlay { position: fixed; inset: 0; background: #000000aa; display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; overflow-y: auto; }
        .toggle { position: relative; width: 38px; height: 22px; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; inset: 0; background: #1e1e2e; border-radius: 22px; cursor: pointer; transition: 0.2s; }
        .toggle-slider:before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #555570; border-radius: 50%; transition: 0.2s; }
        input:checked + .toggle-slider { background: var(--brand); }
        input:checked + .toggle-slider:before { transform: translateX(16px); background: #fff; }
      
        // .upload-box:hover { border-color: #7c3aed; }
        .upload-input { display: none; }
        .banner-card-container { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
        .banner-preview-wrapper { display: flex; gap: 12px; align-items: center; flex: 1; min-width: 0; }
        .banner-preview-item { display: flex; flex-direction: column; gap: 4px; }
        .banner-preview-label { font-size: 10px; font-weight: 600; color: #44445a; text-transform: uppercase; letter-spacing: 0.05em; }
        .banner-preview-image { background: #0a0a0f; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        
        /* Mobile - stack layout */
        @media (max-width: 768px) {
          .banner-card { flex-direction: column !important; gap: 12px !important; padding: 12px !important; }
          .banner-preview-wrapper { flex-direction: column; gap: 12px; }
          .banner-preview-item { width: 100%; }
          .banner-preview-image { width: 100%; height: 150px !important; }
          .banner-actions { flex-direction: column !important; gap: 12px; }
          .btn-primary { width: 100%; }
          .btn-ghost { width: 100%; }
        }
        
        /* Extra small - further optimization */
        @media (max-width: 640px) {
          .overlay { padding: 12px; }
          .banner-preview-image { height: 120px !important; }
        }

        .select-input {
          background: #1e1e2e;
          border: 1px solid #33334d;
          color: #e8e8f0;
          border-radius: 6px;
          padding: 8px;
          font-size: 12px;
          width: 100%;
          outline: none;
        }
        .select-input:focus {
          border-color: var(--brand);
        }
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }
      `}</style>

      {/* Header */}
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12, width: "100%" }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: "#e8e8f0", margin: 0 }}>Banners</h1>
          <p style={{ fontSize: 13, color: "#44445a", margin: "4px 0 0 0" }}>{banners.filter(b => b.isActive).length} active</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Banner</button>
      </div>

      {/* Banner list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24, width: "100%" }}>
        {banners.map((banner) => (
          <div key={banner._id} className="card banner-card" style={{ overflow: "hidden", opacity: banner.isActive ? 1 : 0.5, display: "flex", padding: 16, justifyContent: "space-between", alignItems: "center" }}>
            {/* Banner previews */}
            <div className="banner-preview-wrapper">
              {/* Desktop preview */}
              <div className="banner-preview-item">
                <span className="banner-preview-label">Desktop</span>
                <div className="banner-preview-image" style={{ width: "240px", height: "120px" }}>
                  <Image src={banner.desktopImage} alt="desktop banner" width={240} height={120} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>

              {/* Mobile preview */}
              <div className="banner-preview-item">
                <span className="banner-preview-label">Mobile</span>
                <div className="banner-preview-image" style={{ width: "80px", height: "120px" }}>
                  <Image src={banner.mobileImage} alt="mobile banner" width={80} height={120} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="banner-actions" style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>

              <button className="btn-ghost" onClick={() => remove(banner._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: "clamp(300px, 90vw, 500px)", padding: "clamp(16px, 5vw, 32px)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 700, color: "#e8e8f0", marginBottom: 20 }}>
              New Banner
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="Desktop Image (Required)">
                <label className="upload-box" style={{ cursor: "pointer", padding: "20px 16px" }}>
                  {desktopImage ? (
                    <div style={{ position: "relative", width: "100%", height: "150px" }}>
                      <Image
                        src={desktopImage}
                        alt="desktop preview"
                        width={400}
                        height={150}
                        style={{ width: "100%", height: "100%", borderRadius: 6, objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: 8, right: 8, background: "var(--brand)", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        Selected
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "30px 0" }}>
                      <div style={{ fontSize: 13, color: "#555570", fontWeight: 500 }}>📁 Click to upload desktop image</div>
                      <div style={{ fontSize: 11, color: "#44445a", marginTop: 6 }}>Recommended: 1920x400px</div>
                    </div>
                  )}
                  <input className="upload-input" type="file" accept="image/*" onChange={(e) => handleFile(e, "desktop")} />
                </label>
                <div className="options-grid">
                  <div>
                    <div style={{ fontSize: 10, color: "#555570", marginBottom: 4 }}>Fit</div>
                    <select className="select-input" value={desktopFit} onChange={(e) => setDesktopFit(e.target.value)}>
                      <option value="cover">Cover (Fill)</option>
                      <option value="contain">Contain (Full Image)</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#555570", marginBottom: 4 }}>Position</div>
                    <select className="select-input" value={desktopPosition} onChange={(e) => setDesktopPosition(e.target.value)}>
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </Field>
 
              <Field label="Mobile Image (Required)">
                <label className="upload-box" style={{ cursor: "pointer", padding: "20px 16px" }}>
                  {mobileImage ? (
                    <div style={{ position: "relative", width: "100%", height: "150px" }}>
                      <Image
                        src={mobileImage}
                        alt="mobile preview"
                        width={300}
                        height={150}
                        style={{ width: "100%", height: "100%", borderRadius: 6, objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: 8, right: 8, background: "var(--brand)", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        Selected
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "30px 0" }}>
                      <div style={{ fontSize: 13, color: "#555570", fontWeight: 500 }}>📱 Click to upload mobile image</div>
                      <div style={{ fontSize: 11, color: "#44445a", marginTop: 6 }}>Recommended: 540x600px</div>
                    </div>
                  )}
                  <input className="upload-input" type="file" accept="image/*" onChange={(e) => handleFile(e, "mobile")} />
                </label>
                <div className="options-grid">
                  <div>
                    <div style={{ fontSize: 10, color: "#555570", marginBottom: 4 }}>Fit</div>
                    <select className="select-input" value={mobileFit} onChange={(e) => setMobileFit(e.target.value)}>
                      <option value="cover">Cover (Fill)</option>
                      <option value="contain">Contain (Full Image)</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#555570", marginBottom: 4 }}>Position</div>
                    <select className="select-input" value={mobilePosition} onChange={(e) => setMobilePosition(e.target.value)}>
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: "1 1 auto", minWidth: "100px" }}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={addBanner}
                disabled={!desktopImage || !mobileImage || loading}
                style={{ flex: "1 1 auto", minWidth: "100px" }}
              >
                {loading ? "Uploading..." : "Add Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#555570", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
