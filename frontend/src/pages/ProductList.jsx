// src/pages/ProductList.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductList.css';

const categories = ['Tout voir', 'Audio', 'Ordinateurs', 'Téléphones', 'Accessoires', 'Composants', 'Écrans & tablettes'];

// La recherche, le filtre et le tri s'appliquent aux produits reçus de l'API.
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Tout voir');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');
  const { dispatch } = useCart();

  useEffect(() => {
    fetchProducts().then((response) => setProducts(response.data)).catch(() => setError('Le catalogue est momentanément indisponible.')).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('fr-FR');
    const list = products.filter((product) => (category === 'Tout voir' || product.category === category) && (!search || `${product.name} ${product.description}`.toLocaleLowerCase('fr-FR').includes(search)));
    if (sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, category, query, sort]);

  const addToCart = (product) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, id: product._id, quantity: 1 },
    });
    setAdded(product._id);
    window.setTimeout(() => setAdded(''), 1800);
  };

  return (
    <div className="storefront">
      <section className="store-hero" aria-label="Bienvenue chez TechLuna">
        <div className="hero-copy"><p className="eyebrow">LA SÉLECTION TECHLUNA</p><h1>La tech a<br /><em>du style.</em></h1><p className="hero-intro">Des essentiels choisis pour travailler, créer et profiter de chaque instant, avec une élégance qui vous ressemble.</p><a href="#catalogue" className="hero-link">Découvrir la collection <span aria-hidden="true">↗</span></a><div className="hero-note">Une expérience pensée avec attention.</div></div>
        <div className="hero-art"><div className="hero-orbit" /><img src="/images/audio/casque-apple.jpg" alt="Casque audio mauve de la collection" /><span className="hero-sticker">Notre sélection<br />Audio</span></div>
      </section>

      <section className="store-perks" aria-label="Nos engagements"><span>✦ Une sélection inspirante</span><span>✦ Des essentiels pour chaque projet</span><span>✦ Une boutique pensée pour vous</span></section>

      <section className="catalogue" id="catalogue"><div className="catalogue-heading"><div><p className="eyebrow">DÉCOUVRIR</p><h2>Le catalogue</h2><p>Explorez nos univers et trouvez votre prochain coup de cœur.</p></div><label className="search-box"><span aria-hidden="true">⌕</span><input type="search" placeholder="Rechercher un produit" aria-label="Rechercher un produit" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
        <div className="catalogue-toolbar"><div className="category-list" aria-label="Catégories">{categories.map((item) => <button key={item} type="button" className={category === item ? 'category-chip active' : 'category-chip'} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div><label className="sort-box">Trier par <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Sélection</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></select></label></div>
        <p className="result-count">{loading ? 'Chargement de la collection…' : `${visible.length} produit${visible.length > 1 ? 's' : ''}`}</p>
        {error && <p className="catalogue-message" role="alert">{error}</p>}
        {!loading && !error && visible.length === 0 && <p className="catalogue-message">Aucun produit trouvé dans cette sélection.</p>}
        <ul className="product-grid">{visible.map((product) => <li key={product._id} className="product-card"><div className="product-image-wrap">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : <div className="image-placeholder">TechLuna</div>}<span className="product-category">{product.category}</span></div><div className="product-details"><h3>{product.name}</h3><p className="product-description">{product.description}</p><div className="product-footer"><strong>{Number(product.price).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong><button type="button" onClick={() => addToCart(product)} disabled={product.stock < 1} aria-label={`Ajouter ${product.name} au panier`}>{product.stock < 1 ? 'Épuisé' : added === product._id ? 'Ajouté ✓' : 'Ajouter +'} </button></div></div></li>)}</ul>
      </section>
    </div>
  );
};

export default ProductList;
