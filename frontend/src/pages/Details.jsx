
import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { useParams} from "react-router-dom";
import Loader from "../components/Loader";

export function Details () {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data.data);
                await new Promise(resolve => setTimeout(resolve, 2000))
            } catch {
                setError('Erreur lors du chargement du produit');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (<Loader/>);
    }
    if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
        );
    }
    if (!product) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center text-gray-500">
                    Produit non trouvé
                </div>
            </div>
        );
    }
    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {product.primaryImage && (
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                                src={product.primaryImage ? `http://localhost:3000${product.primaryImage}` : '/placeholder.jpg'} 
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    {product.secondaryImages?.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.secondaryImages.map((image, index) => (
                                <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                    <img 
                                        src={`http://localhost:3000${image}`} 
                                        alt={`${product.title} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info Section */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {product.title}
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                                product.published 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {product.published ? 'Publié' : 'Non publié'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Prix</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-blue-600">
                                        {product.price} MAD
                                    </span>
                                    {product.ex_price && (
                                        <span className="text-lg text-gray-500 line-through">
                                            {product.ex_price}€
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Stock</h3>
                                <span className={`text-lg font-medium ${
                                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {product.stock > 0 ? `${product.stock} disponible(s)` : 'Rupture de stock'}
                                </span>
                            </div>
                        </div>

                        {product.categories?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Catégories</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.categories.map((category, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {typeof category === 'object' ? category.name : category}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">ID Produit:</span>
                                <p className="break-all">{product._id}</p>
                            </div>
                            <div>
                                <span className="font-medium">ID Vendeur:</span>
                                <p className="break-all">
                                    {product.seller_id?.fullname 
                                    ? product.seller_id?.fullname.charAt(0).toUpperCase() + product.seller_id?.fullname.slice(1)
                                    : 'Nom non disponible'}</p>
                            </div>
                            <div>
                                <span className="font-medium">Créé le:</span>
                                <p>{new Date(product.createdAt).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div>
                                <span className="font-medium">Version:</span>
                                <p>v{product.__v}</p>
                            </div>
                        </div>

                        {product.stock > 0 && (
                            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                Ajouter au panier
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}