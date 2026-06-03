"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { getApiUrl } from "../lib/getApiUrl";

/* ─── Types ─────────────────────────────────────────── */
type Product = {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  category?: { _id: string; name: string } | null;
  subcategory?: { _id: string; name: string } | null;
  mainImage: string;
  gallery: string[];
  mrpPrice: number;
  offerAmount: number;
  sellingPrice: number;
  totalStock: number;
  isActive: boolean;
};

type Category = { _id: string; name: string };
type Subcategory = { _id: string; name: string };

/* ─── Helpers ────────────────────────────────────────── */
const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

/* ─── Main Component ─────────────────────────────────── */
export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [mrpPrice, setMrpPrice] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [totalStock, setTotalStock] = useState("");
  const [api, setApi] = useState("");

  // Fetch functions
  const fetchProducts = useCallback(async () => {
    if (!api) return;
    try {
      const res = await fetchWithAuth(`${api}/product`);
      const data = await res.json();
      
      // Filter: Only include products with complete admin data (NEW schema)
      // Don't show incomplete or old data
      if (data.products && Array.isArray(data.products)) {
        const filteredProducts = data.products.filter((p: Product) => {
          // Must have all required fields from new schema
          return p.mainImage && 
                 p.name && 
                 p.mrpPrice !== undefined && 
                 p.totalStock !== undefined;
        });
        setProducts(filteredProducts);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
      setProducts([]);
    }
  }, [api]);

  const fetchCategories = useCallback(async () => {
    if (!api) return;
    try {
      const res = await fetchWithAuth(`${api}/category`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      setCategories([]);
    }
  }, [api]);

  const fetchSubcategories = useCallback(async () => {
    if (!api) return;
    try {
      const res = await fetchWithAuth(`${api}/subcategory`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.subcategories && Array.isArray(data.subcategories)) {
        setSubcategories(data.subcategories);
      } else if (Array.isArray(data)) {
        setSubcategories(data);
      } else {
        setSubcategories([]);
      }
    } catch (e) {
      console.error('Failed to fetch subcategories:', e);
      setSubcategories([]);
    }
  }, [api]);

  useEffect(() => {
    setApi(getApiUrl());
  }, []);

  useEffect(() => {
    if (api) {
      fetchProducts();
      fetchCategories();
      fetchSubcategories();
    }
  }, [api, fetchProducts, fetchCategories, fetchSubcategories]);

  // Auto-calculate selling price
  useEffect(() => {
    const mrp = Number(mrpPrice) || 0;
    const offer = Number(offerAmount) || 0;
    const selling = Math.max(0, mrp - offer);
    setSellingPrice(selling.toString());
  }, [mrpPrice, offerAmount]);

  /* ── Image handlers ── */
  const handleMainImageAdd = async (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    setSaving(true);
    
    try {
      const b64 = await toBase64(file);
      const res = await fetchWithAuth(`${api}/product/image/upload`, {
        method: "POST",
        body: JSON.stringify({ image: b64 }),
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setMainImage(data.imageUrl);
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error while uploading image.");
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryAdd = async (files: FileList) => {
    if (files.length === 0) return;
    const maxGallery = 4;
    if (gallery.length >= maxGallery) {
      setError(`Maximum ${maxGallery} gallery images allowed.`);
      return;
    }

    setSaving(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (gallery.length + uploadedUrls.length >= maxGallery) break;
      
      try {
        const b64 = await toBase64(file);
        const res = await fetchWithAuth(`${api}/product/image/upload`, {
          method: "POST",
          body: JSON.stringify({ image: b64 }),
        });
        const data = await res.json();
        if (res.ok && data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        } else {
          setError(data.error || "Failed to upload image.");
        }
      } catch (e) {
        console.error(e);
        setError("Network error while uploading image.");
      }
    }

    setSaving(false);
    if (uploadedUrls.length > 0) {
      setGallery(prev => [...prev, ...uploadedUrls]);
    }
  };

  const removeMainImage = async () => {
    if (!mainImage || mainImage.startsWith("data:image")) {
      setMainImage("");
      return;
    }

    if (!confirm("Delete this image from server and product?")) return;

    try {
      const res = await fetchWithAuth(`${api}/product/image/delete`, {
        method: "POST",
        body: JSON.stringify({ url: mainImage }),
      });
      if (res.ok) {
        setMainImage("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeGalleryImage = async (index: number) => {
    const img = gallery[index];
    if (!img) return;

    if (!img.startsWith("data:image")) {
      if (!confirm("Delete this image from server?")) return;
      try {
        const res = await fetchWithAuth(`${api}/product/image/delete`, {
          method: "POST",
          body: JSON.stringify({ url: img }),
        });
        if (!res.ok) {
          console.warn("Failed to delete remote image");
        }
      } catch (e) {
        console.error(e);
      }
    }

    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  /* ── Reset ── */
  const resetForm = () => {
    setName("");
    setShortDescription("");
    setDescription("");
    setCategoryId("");
    setSubcategoryId("");
    setMainImage("");
    setGallery([]);
    setMrpPrice("");
    setOfferAmount("");
    setSellingPrice("");
    setTotalStock("");
    setEditId(null);
    setError("");
  };

  /* ── Validate ── */
  const validate = (): string | null => {
    if (!name.trim()) return "Product name is required.";
    if (!shortDescription.trim()) return "Short description is required.";
    if (!description.trim()) return "Full description is required.";
    if (!mainImage) return "Main image is required.";
    
    const mrp = Number(mrpPrice);
    if (!mrpPrice || mrp <= 0) return "Valid MRP price is required.";
    
    const offer = Number(offerAmount) || 0;
    if (offer < 0) return "Offer amount cannot be negative.";
    
    const stock = Number(totalStock);
    if (totalStock === "" || stock < 0) return "Valid stock quantity is required.";
    
    return null;
  };

  /* ── Save ── */
  const saveProduct = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name,
      shortDescription,
      description,
      category: categoryId || undefined,
      subcategory: subcategoryId || undefined,
      mainImage,
      gallery,
      mrpPrice: Number(mrpPrice),
      offerAmount: Number(offerAmount),
      totalStock: Number(totalStock),
    };

    try {
      const url = editId
        ? `${api}/product/update/${editId}`
        : `${api}/product/add`;
      const method = editId ? "PUT" : "POST";

      const res = await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }

      if (editId) {
        setProducts(prev => prev.map(p => p._id === editId ? data.product : p));
      } else {
        setProducts(prev => [...prev, data.product]);
      }
      
      resetForm();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      setError("Network error. Is the server running?");
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit ── */
  const handleEdit = (p: Product) => {
    setEditId(p._id);
    setName(p.name);
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setCategoryId(p.category?._id || "");
    setSubcategoryId(p.subcategory?._id || "");
    setMainImage(p.mainImage);
    setGallery(p.gallery || []);
    setMrpPrice(String(p.mrpPrice));
    setOfferAmount(String(p.offerAmount));
    setSellingPrice(String(p.sellingPrice));
    setTotalStock(String(p.totalStock));
    setError("");
    setShowModal(true);
  };

  /* ── Delete ── */
  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetchWithAuth(`${api}/product/delete/${id}`, { method: "DELETE" });
      if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <style>{`
        .card{background:#13131a;border:1px solid #1e1e2e;border-radius:12px;}
        .btn-primary{background:var(--brand);color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .btn-primary:hover{background:var(--brand-dark);}
        .btn-primary:disabled{opacity:.5;cursor:not-allowed;}
        .btn-ghost{background:transparent;color:#555570;border:1px solid #1e1e2e;border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;transition:all 0.2s;}
        .btn-ghost:hover{color:#ef4444;border-color:#ef444440;}
        .btn-sm{background:#1e1e2e;color:var(--brand);border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;transition:all 0.2s;}
        .btn-sm:hover{background:#2a2a40;}
        .input{background:#0f0f13;border:1px solid #1e1e2e;border-radius:8px;color:#e8e8f0;padding:10px;width:100%;box-sizing:border-box;font-size:13px;outline:none;}
        .input:focus{border-color:var(--brand);}
        .overlay{position:fixed;inset:0;background:#000000bb;display:flex;align-items:center;justify-content:center;z-index:100;}
        .err{color:#ef4444;font-size:12px;margin-bottom:12px;background:#ef444415;padding:8px 12px;border-radius:6px;}
        .img-thumb{width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid #1e1e2e;}
        .img-remove{position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .trow td{padding:14px 20px;border-bottom:1px solid #1a1a26;color:#e8e8f0;font-size:13px;}
        .modal-card{scrollbar-width:none;-ms-overflow-style:none;}
        .modal-card::-webkit-scrollbar{display:none;}
        .price-display{background:#1a1a26;border-radius:6px;padding:10px;margin-top:6px;}
        .price-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;}
        .price-row:last-child{margin-bottom:0;}
        .price-label{color:#555570;}
        .price-value{color:var(--brand);font-weight:600;}
        
        @media (max-width: 1024px) {
          .btn-primary { padding: 8px 16px; font-size: 12px; }
          .btn-ghost { padding: 5px 10px; font-size: 11px; }
          .trow td { padding: 10px 12px; font-size: 12px; }
        }
        @media (max-width: 768px) {
          .trow { display: block; margin-bottom: 16px; border: 1px solid #1e1e2e; border-radius: 8px; padding: 12px; }
          .trow td { display: block; padding: 8px 0; border: none; margin-bottom: 8px; }
          .trow td:before { content: attr(data-label); font-weight: 600; color: #d4af37; display: block; margin-bottom: 4px; }
          .overlay { padding: 16px; }
          .modal-card { width: calc(100% - 32px) !important; max-height: 90vh !important; }
        }
        @media (max-width: 640px) {
          .modal-card { width: calc(100% - 24px) !important; padding: 16px !important; }
          .input { font-size: 14px; }
          .btn-primary { padding: 8px 12px; font-size: 12px; width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12, width: "100%" }}>
        <div>
          <h1 style={{ color: "#e8e8f0", fontFamily: "'Syne',sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, margin: 0 }}>Products</h1>
          <p style={{ color: "#44445a", fontSize: 13, margin: "4px 0 0 0" }}>{products.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Product</button>
      </div>

      {/* Search */}
      <input className="input" style={{ marginBottom: 20, width: "100%" }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />

      {/* Table */}
      <div className="card" style={{ overflowX: "auto", overflowY: "hidden", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
              {["Product", "Category", "Pricing", "Stock", "Actions"].map(h => (
                <td key={h} style={{ padding: "12px 20px", fontSize: 11, color: "#555570", fontWeight: 600, textTransform: "uppercase" }}>{h}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#44445a", fontSize: 13 }}>No products yet</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p._id} className="trow">
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {p.mainImage ? (
                      <img 
                        src={p.mainImage} 
                        alt={p.name}
                        className="img-thumb"
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #1e1e2e" }}
                      />
                    ) : (
                      <div style={{ width: 60, height: 60, borderRadius: 6, background: "#1e1e2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#555570" }}>{p.shortDescription.substring(0, 30)}...</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--brand)", fontSize: 12 }}>{p.category?.name || "—"}</td>
                <td>
                  <div style={{ fontSize: 12 }}>
                    <div style={{ color: "#e8e8f0", marginBottom: 3 }}>₹{p.sellingPrice}</div>
                    <div style={{ fontSize: 10, color: "#555570", textDecoration: "line-through" }}>MRP ₹{p.mrpPrice}</div>
                    {p.offerAmount > 0 && <div style={{ fontSize: 10, color: "#10b981" }}>-₹{p.offerAmount}</div>}
                  </div>
                </td>
                <td style={{ fontSize: 12, color: "#e8e8f0" }}>{p.totalStock} units</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ghost" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn-ghost" onClick={() => remove(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="card modal-card" style={{ width: "clamp(300px, 90vw, 700px)", padding: "clamp(16px, 4vw, 28px)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 20 }}>
              {editId ? "Edit Product" : "New Product"}
            </div>

            {error && <div className="err">{error}</div>}

            {/* Basic Information */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <Field label="Product Name *">
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Car Wax Polish" />
              </Field>

              <Field label="Short Description *">
                <input className="input" value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Brief product summary" />
              </Field>

              <Field label="Full Description *">
                <textarea className="input" value={description} rows={3} onChange={e => setDescription(e.target.value)} placeholder="Detailed product description" style={{ resize: "vertical" }} />
              </Field>

              <div style={{ display: "flex", gap: 12 }}>
                <Field label="Category">
                  <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">— Select category —</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Brands">
                  <select className="input" value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)}>
                    <option value="">— Select Brands (optional) —</option>
                    {subcategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Images */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e8f0", marginBottom: 10 }}>Product Images *</div>

              {/* Main Image */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)" }}>Main Image</span>
                  {!mainImage && (
                    <label style={{ cursor: "pointer", background: "#1e1e2e", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "var(--brand)", border: "1px solid var(--brand-dark)" }}>
                      + Upload
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files && handleMainImageAdd(e.target.files)} />
                    </label>
                  )}
                </div>

                {mainImage && (
                  <div style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid #1e1e2e" }}>
                    <Image src={mainImage} alt="main" fill style={{ objectFit: "cover" }} unoptimized />
                    <button className="img-remove" onClick={removeMainImage}>×</button>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)" }}>
                    Gallery Images <span style={{ color: "#555570", fontWeight: 400 }}>({gallery.length}/4)</span>
                  </span>
                  {gallery.length < 4 && (
                    <label style={{ cursor: "pointer", background: "#1e1e2e", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "var(--brand)", border: "1px solid var(--brand-dark)" }}>
                      + Add
                      <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleGalleryAdd(e.target.files)} />
                    </label>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8 }}>
                  {gallery.map((img, i) => (
                    <div key={i} style={{ position: "relative", width: "100%", paddingBottom: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid #1e1e2e" }}>
                      <Image src={img} alt={`gallery-${i}`} fill style={{ objectFit: "cover", position: "absolute" }} unoptimized />
                      <button className="img-remove" onClick={() => removeGalleryImage(i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e8f0", marginBottom: 10 }}>Pricing *</div>

              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <Field label="MRP Price (₹)">
                  <input className="input" type="number" min="0" value={mrpPrice} onChange={e => setMrpPrice(e.target.value)} placeholder="0" />
                </Field>
                <Field label="Offer Amount (₹)">
                  <input className="input" type="number" min="0" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} placeholder="0" />
                </Field>
              </div>

              {/* Price preview */}
              {mrpPrice && (
                <div className="price-display">
                  <div className="price-row">
                    <span className="price-label">MRP:</span>
                    <span className="price-value" style={{ textDecoration: "line-through" }}>₹{Number(mrpPrice).toFixed(2)}</span>
                  </div>
                  {Number(offerAmount) > 0 && (
                    <div className="price-row">
                      <span className="price-label">Discount:</span>
                      <span className="price-value" style={{ color: "#ef4444" }}>-₹{Number(offerAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="price-row" style={{ borderTop: "1px solid #2a2a38", paddingTop: 6, marginTop: 6 }}>
                    <span className="price-label">Selling Price:</span>
                    <span className="price-value" style={{ fontSize: 14 }}>₹{Number(sellingPrice).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: 24 }}>
              <Field label="Total Stock (Units) *">
                <input className="input" type="number" min="0" value={totalStock} onChange={e => setTotalStock(e.target.value)} placeholder="0" />
              </Field>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={saveProduct} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)" }}>{label}</label>
      {children}
    </div>
  );
}
