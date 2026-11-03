// src/pages/Admin.js
import React, { useState, useEffect } from "react";
import {
  getOrders,
  updateOrderStatus,
  // validateOrder,
  getProducts,
  updateProductStock,
  createProduct,
  editProduct,
  deleteProduct,
  getUsers,
  updateUserRole,
} from "../services/secureAdminApi";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', description: '', category: 'Audio', price: '', stock: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(null);
  const [newStock, setNewStock] = useState({}); // Stock temporaire par produit
  const [updatingStock, setUpdatingStock] = useState(null); // Stock en cours de mise à jour

  useEffect(() => {
    const fetchData = async () => {
      const ordersResponse = await getOrders();
      setOrders(ordersResponse.data);

      const productsResponse = await getProducts();
      setProducts(productsResponse.data);
      const usersResponse = await getUsers();
      setUsers(usersResponse.data);
    };

    fetchData().catch(() => alert('Impossible de charger les données administrateur.'));
  }, []);

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setLoadingOrder(orderId); // Active le loader
    try {
      await updateOrderStatus(orderId, newStatus);

      // Mettre à jour l'état local après une mise à jour réussie
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert(`Statut de la commande ${orderId} mis à jour en "${newStatus}".`);
    } catch {
      alert("Erreur lors de la mise à jour du statut de la commande.");
    }
    setLoadingOrder(null); // Désactive le loader
  };

  // const handleOrderValidation = async (orderId) => {
  //   await validateOrder(orderId);
  //   alert(`Commande ${orderId} validée.`);
  // };

  const handleStockUpdate = async (productId) => {
    const stockValue = newStock[productId]; // Récupère la valeur saisie pour ce produit

    if (stockValue === '' || !Number.isInteger(Number(stockValue)) || Number(stockValue) < 0) {
      alert("Veuillez entrer une quantité de stock valide.");
      return;
    }

    try {
      setUpdatingStock(productId); // Active le loader
      await updateProductStock(productId, Number(stockValue));
      alert(`Stock du produit mis à jour à ${stockValue}.`);

      // Mise à jour de l'affichage avec le nouveau stock
      const updatedProducts = products.map((product) =>
        product._id === productId ? { ...product, stock: Number(stockValue) } : product
      );
      setProducts(updatedProducts);

      // Réinitialisation du champ
      setNewStock({ ...newStock, [productId]: "" });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock :", error);
      alert("Échec de la mise à jour du stock.");
    } finally {
      setUpdatingStock(null); // Désactive le loader
    }
  };

  const handleProductCreate = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) };
      const { data } = editingId ? await editProduct(editingId, payload) : await createProduct(payload);
      setProducts((previous) => editingId ? previous.map((product) => product._id === editingId ? data : product) : [...previous, data]);
      setProductForm({ name: '', description: '', category: 'Audio', price: '', stock: '', imageUrl: '' });
      setEditingId(null);
    } catch (error) { alert(error.response?.data?.message || 'Création impossible.'); }
  };
  const handleProductDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try { await deleteProduct(id); setProducts((previous) => previous.filter((product) => product._id !== id)); }
    catch { alert('Suppression impossible.'); }
  };
  const handleUserRole = async (id, role) => {
    try { const { data } = await updateUserRole(id, role); setUsers((previous) => previous.map((user) => user._id === id ? data : user)); }
    catch (error) { alert(error.response?.data?.message || 'Modification du rôle impossible.'); }
  };

  return (
    <div className="interior-page">
      <p className="eyebrow">TECHLUNA · BACK OFFICE</p><h1>Administration</h1>
      <form onSubmit={handleProductCreate} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
        <h3 className="text-xl font-semibold md:col-span-2">{editingId ? 'Modifier le produit' : 'Ajouter un produit'}</h3>
        <label className="block text-sm">Catégorie<select className="block w-full mt-1" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}>{['Audio', 'Ordinateurs', 'Téléphones', 'Accessoires', 'Composants', 'Écrans & tablettes'].map((item) => <option key={item}>{item}</option>)}</select></label>
        {['name', 'description', 'price', 'stock', 'imageUrl'].map((field) => <label key={field} className="block text-sm">{({ name: 'Nom', description: 'Description', price: 'Prix (€)', stock: 'Stock', imageUrl: 'URL image' })[field]}<input className="block w-full mt-1" type={['price', 'stock'].includes(field) ? 'number' : 'text'} min={field === 'price' || field === 'stock' ? '0' : undefined} step={field === 'price' ? '0.01' : '1'} required={field !== 'imageUrl'} value={productForm[field]} onChange={(event) => setProductForm({ ...productForm, [field]: event.target.value })} /></label>)}
        <button className="bg-blue-500 text-white rounded px-4 py-2">{editingId ? 'Enregistrer' : 'Créer'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setProductForm({ name: '', description: '', category: 'Audio', price: '', stock: '', imageUrl: '' }); }}>Annuler</button>}
      </form>
      {/* Gestion des Commandes */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Gestion des Commandes</h3>
        <ul>
          {orders.map((order) => (
            <li key={order._id} className="border p-4 mb-4 rounded shadow">
              <p>
                <strong>ID :</strong> {order._id}
              </p>
              <p>
                <strong>Status :</strong> {order.status}
              </p>
              {order.status !== "Expédiée" && (
                <button
                  onClick={() => handleOrderStatusChange(order._id, "Expédiée")}
                  className="bg-blue-500 text-white px-2 py-1 mt-2 rounded mr-2"
                  disabled={loadingOrder === order._id}
                >
                  {loadingOrder === order._id
                    ? "Mise à jour..."
                    : 'Changer état à "Expédiée"'}
                </button>
              )}

              {order.status !== "En cours de traitement" &&
                order.status !== "Expédiée" && (
                  <button
                    onClick={() =>
                      handleOrderStatusChange(
                        order._id,
                        "En cours de traitement"
                      )
                    }
                    className="bg-green-500 text-white px-2 py-1 mt-2 rounded"
                  >
                    Valider la commande
                  </button>
                )}

              <button
                onClick={() => setSelectedOrder(order)}
                className="bg-gray-500 text-white ml-2 px-2 py-1 mt-2 rounded"
              >
                Détails
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Gestion des Produits */}
      <div>
        <h2 className="text-xl font-bold">Gestion des Produits</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Nom</th>
              <th className="border px-4 py-2">Prix</th>
              <th className="border px-4 py-2">Stock</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border">
                <td className="border px-4 py-2">{product.name}</td>
                <td className="border px-4 py-2">{product.price} €</td>
                <td className="border px-4 py-2">{product.stock}</td>
                <td className="border px-4 py-2 flex">
                  <input
                    type="number"
                    placeholder="Nouveau stock"
                    min="0"
                      value={newStock[product._id] ?? ""}
                    className="border p-2 w-20"
                    onChange={(e) =>
                      setNewStock({
                        ...newStock,
                        [product._id]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => handleStockUpdate(product._id)}
                    className="bg-green-500 text-white px-2 py-1 ml-2 rounded"
                    disabled={updatingStock === product._id}
                  >
                    {updatingStock === product._id
                      ? "Mise à jour..."
                      : "Mettre à jour"}
                  </button>
                  <button onClick={() => { setEditingId(product._id); setProductForm({ name: product.name, description: product.description, category: product.category || 'Accessoires', price: String(product.price), stock: String(product.stock), imageUrl: product.imageUrl || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-gray-500 text-white px-2 py-1 ml-2 rounded">Modifier</button>
                  <button onClick={() => handleProductDelete(product._id)} className="bg-red-500 text-white px-2 py-1 ml-2 rounded">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">Utilisateurs</h2>
        <div className="bg-white rounded shadow p-4 space-y-3">{users.map((user) => <div key={user._id} className="flex justify-between items-center border-b pb-2"><span>{user.username} · {user.email}</span><select value={user.role} onChange={(event) => handleUserRole(user._id, event.target.value)}><option value="user">Client</option><option value="admin">Administrateur</option></select></div>)}</div>
      </section>

      {/* Fenêtre modale pour afficher les détails de la commande */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Détails de la Commande</h2>
            <p>
              <strong>ID :</strong> {selectedOrder._id}
            </p>
            <p>
              <strong>Status :</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Total :</strong> {selectedOrder.total} €
            </p>
            <h3 className="text-lg font-semibold mt-4">Produits :</h3>
            <ul className="mt-2">
              {selectedOrder.items.map((item, index) => (
                <li key={index} className="border-b p-2">
                  <p>
                    <strong>Produit ID :</strong> {item.productId}
                  </p>
                  <p>
                    <strong>Quantité :</strong> {item.quantity}
                  </p>
                  <p>
                    <strong>Prix :</strong> {item.price} €
                  </p>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedOrder(null)}
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
