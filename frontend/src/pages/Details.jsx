import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { reviewService } from "../services/reviewService";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Loader from "../components/tools/Loader";
import Button from "../components/tools/Button";

export function Details () {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productData, reviewData] = await Promise.all([
                    productService.getProductById(id),
                    reviewService.getProductReviews(id)
                ]);
                setProduct(productData.data);
                setReviews(reviewData);
                await new Promise(resolve => setTimeout(resolve, 2000))
            } catch {
                setError('Erreur lors du chargement du produit');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddToCart = async () => {
        await addToCart(product);
        navigate('/cart');
    };

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
                                src={product.primaryImage ? `${import.meta.env.VITE_BACKEND_BASE_URL}${product.primaryImage}` : '/placeholder.jpg'} 
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

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {product.title}
                        </h1>
                        <div className="gap items-center gap-2 mb-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                                product.published 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {product.published ? 'Publié' : 'Non publié'}
                            </span>
                            {reviews && (
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>{i < Math.floor(reviews.averageRating) ? <i className="fa-solid fa-star text-yellow-400"></i> : <i className="fa-solid fa-star text-gray-300"></i>}</span>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {reviews.averageRating.toFixed(1)} ({reviews.total} avis)
                                    </span>
                                </div>
                            )}
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
                                            {product.ex_price} MAD
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
                        </div>

                        {product.stock > 0 && (
                            <Button 
                                variant="outline" 
                                style={{ backgroundColor: '#D43601' }}
                                onClick={handleAddToCart}
                            >
                                Add To Cart
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {reviews && reviews.data.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Avis des clients</h2>
                    <div className="space-y-4">
                        {reviews.data.map((review) => (
                            <div key={review._id} className="border rounded-lg p-4">
                                <div className="grid items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{review.user.fullname}</span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>{i < review.rating ? <i className="fa-solid fa-star text-yellow-400"></i>  : <i className="fa-solid fa-star text-gray-300"></i>}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
