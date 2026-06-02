"use client";
import { useState, useEffect, useCallback, ReactNode } from "react";
import { getApiUrl } from "../../../../lib/getApiUrl";
type SubCategory = { _id: string; name: string };
type FieldProps = { label: string; children: ReactNode };
type HeaderProps = { title: string; sub: string; onAdd: () => void };

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const api = getApiUrl();

  const fetchSubcategories = useCallback(async () => {
    try {
      console.log("Fetching from:", `${api}/subcategory`);
      const res = await fetch(`${api}/subcategory`);
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers.get("content-type"));
      const text = await res.text();
      console.log("Response text:", text);
      const data = JSON.parse(text);
      if (data.subcategories) setSubcategories(data.subcategories);
    } catch (err) { console.error("Error fetching subcategories:", err); }
  }, [api]);

  useEffect(() => { fetchSubcategories(); }, [fetchSubcategories]);

  const openAdd = () => { setEditId(null); setName(""); setShowModal(true); };

  const handleEdit = (sub: SubCategory) => {
    setEditId(sub._id);
    setName(sub.name);
    setShowModal(true);
  };

  const save = async () => {
    if (!name.trim()) return alert("Name is required.");
    setSaving(true);
    try {
      const authToken = localStorage.getItem("token") || "";
      const res = editId
        ? await fetch(`${api}/subcategory/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: authToken },
          body: JSON.stringify({ name }),
        })
        : await fetch(`${api}/subcategory/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authToken },
          body: JSON.stringify({ name }),
        });

      if (!res.ok) return alert(`Error: ${await res.text()}`);
      const data = await res.json();

      if (data.success) {
        if (editId) {
          setSubcategories(prev => prev.map(s => s._id === editId ? { ...s, name } : s));
        } else {
          setSubcategories(prev => [...prev, data.subcategory]);
        }
        setShowModal(false);
        setEditId(null);
        setName("");
      } else {
        alert(data.error || "Failed to save.");
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      const authToken = localStorage.getItem("token") || "";
      const res = await fetch(`${api}/subcategory/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success) setSubcategories(prev => prev.filter(s => s._id !== id));
      else alert(data.error || "Failed to delete.");
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <style>{`
        .card { background: #13131a; border: 1px solid #1e1e2e; border-radius: 12px; transition: border-color 0.18s; }
        .card:hover { border-color: #2a2a40; }
        .btn-primary { background: var(--brand); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover:not(:disabled) { background: var(--brand-dark); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #555570; border: 1px solid #1e1e2e; border-radius: 8px; padding: 8px 14px; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .btn-ghost:hover { color: #ef4444; border-color: #ef444440; }
        .input { background: #0f0f13; border: 1px solid #1e1e2e; border-radius: 8px; color: #e8e8f0; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .input:focus { border-color: var(--brand); }
        .overlay { position: fixed; inset: 0; background: #000000aa; display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
      `}</style>

      <PageHeader title="Brands" sub={`${subcategories.length} total`} onAdd={openAdd} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
        {subcategories.map(sub => (
          <div key={sub._id} className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#e8e8f0", marginBottom: 16 }}>{sub.name}</div>
            <div style={{ display: "flex", gap: 8, borderTop: "1px solid #1e1e2e", paddingTop: 14 }}>
              <button className="btn-ghost" onClick={() => handleEdit(sub)}>Edit</button>
              <button className="btn-ghost" onClick={() => remove(sub._id)}>Delete</button>
            </div>
          </div>
        ))}
        {subcategories.length === 0 && (
          <div style={{ color: "#44445a", fontSize: 14, padding: 20 }}>No Brands yet.</div>
        )}
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: "clamp(300px, 90vw, 400px)", padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 20 }}>
              {editId ? "Edit Subcategory" : "New Subcategory"}
            </div>
            <FieldLabel label="Subcategory Name">
              <input
                className="input"
                value={name}
                placeholder="e.g. Accessories"
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && save()}
                autoFocus
              />
            </FieldLabel>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => { setShowModal(false); setEditId(null); }}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : editId ? "Save Changes" : "Add Subcategory"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ label, children }: FieldProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#555570", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function PageHeader({ title, sub, onAdd }: HeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
      <div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: "#e8e8f0", margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#44445a", margin: "4px 0 0 0" }}>{sub}</p>
      </div>
      <button className="btn-primary" onClick={onAdd}>+ Add New</button>
    </div>
  );
}
