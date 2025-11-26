import { useState, useEffect } from "react";
import { couponService } from "../../services/couponService";

export function useCoupon(id) {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await couponService.getCouponById(id);
        setCoupon(response.data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement du coupon:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Impossible de charger le coupon"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id]);

  return { coupon, loading, error };
}
